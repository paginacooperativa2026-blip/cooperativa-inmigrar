import {env} from 'cloudflare:workers';
import {getChatGPTUser} from '../app/chatgpt-auth';
import {getDb} from '../db';import {members} from '../db/schema';import {eq} from 'drizzle-orm';
export async function access(){const user=await getChatGPTUser();if(!user)return null;const email=user.email.toLowerCase();const admins=((env as any).ADMIN_EMAILS||'').split(',').map((e:string)=>e.trim().toLowerCase()).filter(Boolean);if(admins.includes(email))return {...user,email,role:'admin'};const member=await getDb().select().from(members).where(eq(members.email,email)).get();if(!member||member.userId&&member.userId!==user.userId)return null;if(!member.userId)await getDb().update(members).set({userId:user.userId}).where(eq(members.email,email));return {...user,email,role:'member'};}
export function sameOrigin(req:Request){return req.headers.get('origin')===new URL(req.url).origin;}
