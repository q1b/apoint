import prisma from "~/lib/prisma";
import crypto from "crypto";
import { server$ } from "@builder.io/qwik-city";
import {
  useSignal,
  type QwikChangeEvent,
  component$,
  $,
  type Signal,
} from "@builder.io/qwik";
import { LuCircle, LuLoader2 } from "@qwikest/icons/lucide";

const generateSHA1 = (data: any) => {
  const hash = crypto.createHash("sha1");
  hash.update(data);
  return hash.digest("hex");
};

const generateSignature = (publicId: string, apiSecret: string) => {
  const timestamp = new Date().getTime();
  return `public_id=${publicId}&timestamp=${timestamp}${apiSecret}`;
};

const regex = /\/v\d+\/([^/]+)\.\w{3,4}$/;

const getPublicIdFromUrl = (cloudinaryUrl: string) => {
  const match = cloudinaryUrl.match(regex);
  return match ? match[1] : null;
};

const env = {
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY as string,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
  PUBLIC_CLOUDINARY_CLOUD_NAME: process.env
    .PUBLIC_CLOUDINARY_CLOUD_NAME as string,
  PUBLIC_CLOUDINARY_UPLOAD_PRESET: process.env
    .PUBLIC_CLOUDINARY_UPLOAD_PRESET as string,
} as const;

const dbSyncImg = async (id: string, image: string) =>
  server$(() => {
    return prisma.user.update({
      where: {
        id,
      },
      data: {
        image,
      },
    });
  });

const deleteImage = server$((cloudinaryUrl: string) => {
  const timestamp = new Date().getTime();

  const publicId = getPublicIdFromUrl(cloudinaryUrl);

  if (!publicId) return null;

  const signature = generateSHA1(
    generateSignature(publicId, env.CLOUDINARY_API_SECRET)
  );

  return fetch(
    `https://api.cloudinary.com/v1_1/${env.PUBLIC_CLOUDINARY_CLOUD_NAME}/image/destroy`,
    {
      method: "POST",
      body: JSON.stringify({
        public_id: publicId,
        signature: signature,
        api_key: env.CLOUDINARY_API_KEY,
        timestamp: timestamp,
      }),
    }
  )
    .then(async (res) => {
      return await res.json();
    })
    .catch((err) => {
      console.error(err);
      return undefined;
    });
});

type UploadResponse = {
  fileName: string;
  url: string;
  message: string;
};

async function uploadImage(
  event: QwikChangeEvent<HTMLInputElement>
): Promise<UploadResponse> {
  return new Promise<UploadResponse>((resolve, reject) => {
    const selectedFile = event.target.files?.[0];
    const fileName = selectedFile?.name.split(".")[0] || "";
    const isImage = selectedFile?.type.includes("image");
    // const fileSizeInMB = selectedFile?.size! / (1024 * 1024) // Convert bytes to MB

    if (!isImage) {
      reject({ message: `Video is not supported` });
      return;
    }

    if (!selectedFile) {
      reject({ message: "No file selected" });
      return;
    }

    uploadFile(selectedFile)
      .then((url) => {
        if (url) {
          resolve({
            fileName,
            url,
            message: "Image is Uploaded",
          });
        }
      })
      .catch((error) => {
        reject(error);
      });
  });
}

const uploadFile = async (file: File): Promise<string | undefined> => {
  if (!file.type.includes("image") && !file.type.includes("video")) {
    return undefined;
  }

  const formData = new FormData();
  formData.append("file", file, file.name);
  formData.append("upload_preset", env.PUBLIC_CLOUDINARY_UPLOAD_PRESET);
  formData.append("cloud_name", env.PUBLIC_CLOUDINARY_CLOUD_NAME);

  try {
    const res = await fetch(
      `https://api.cloudinary.com/v1_1/${env.PUBLIC_CLOUDINARY_CLOUD_NAME}/${
        file.type.includes("image") ? "image" : "video"
      }/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const image = await res.json();
    return image.secure_url;
  } catch (err) {
    console.error(err);
    return undefined;
  }
};

export default component$(
  (props: {
    user: Signal<
      | {
          userId: string;
          name: string;
          image: string;
        }
      | undefined
    >;
  }) => {
    const uploading = useSignal(false);
    const handleUploadImage = $((event: QwikChangeEvent<HTMLInputElement>) => {
      uploading.value = true;
      uploadImage(event)
        .then(async (res) => {
          if (props.user.value?.image) {
            await deleteImage(props.user.value.image),
              alert("REMOVED PREVIOUS IMAGE");
            props.user.value.image = res.url;
            await dbSyncImg(props.user.value.userId, res.url);
          }
          uploading.value = false;
        })
        .catch((err) => {
          uploading.value = false;
          alert(err);
        });
    });
    return (
      <div class="">
        <label class="w-24 h-24 flex items-center justify-center" for="picture">
          {props.user.value?.image ? (
            <image
              alt="Picture"
              class="w-24 h-24 object-cover object-center rounded-full"
              src={props.user.value.image}
            />
          ) : (
            <div class="p-2 bg-slate-100 flex items-center justify-center">
              <span class="sr-only">{props.user.value?.name}</span>
              {uploading.value ? (
                <LuLoader2 class="w-24 h-24 animate-spin text-slate-700" />
              ) : (
                <LuCircle class="h-24 w-24" />
              )}
            </div>
          )}
        </label>
        <input
          id="picture"
          type="file"
          hidden
          class="hidden"
          onChange$={handleUploadImage}
        />
      </div>
    );
  }
);
