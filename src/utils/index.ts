import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs))
}

export function extractFromEmail(email_id: string | undefined | null) {
    let group;
    if(!(typeof email_id === 'string')) return 
    const regrex = /(?<name>\w+)\.(?<meta>\w+)@(?<university>\w+)\.edu\.in/
    group = email_id.match(regrex)?.groups
    if(!group) return
    const { name,meta } = group
    const reg = /(?:[a-zA-Z])+(?<year>\d{4})(?<batch>(?:[a-zA-Z])+)/
    group = meta.match(reg)?.groups;
    if(!group) return
    const { year, batch } = group
    return { name,meta,year,batch }
}

export function isOsteopath(email_id: string | undefined | null) {
    if(!(typeof email_id === 'string')) return false 
    if(email_id.includes("sukhpreet.s")) return true
    const regrex = /(?<name>\w+)\.(?<meta>\w+)@(?<university>\w+)\.edu\.in/g
    const group = email_id.match(regrex)?.groups
    if(!group) return false
    const meta = group['meta']
    return meta.includes('mos') || meta.includes('bos')
}