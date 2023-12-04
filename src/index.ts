import fs from "node:fs"
import path from 'node:path';
import { Attatchment, InputEnterValue, Webhook } from "./lib";
import puppeteer from "puppeteer";
import { PdfReader } from "pdfreader";
import 'dotenv/config';

interface Data {
    last_update: number
    webhooks: string[]
}

const data_path = path.join(__dirname, "../data.json");

let data = JSON.parse(fs.readFileSync(data_path).toString()) as Partial<Data>
let { ENT_ID, ENT_PWD } = process.env;

if (!(ENT_ID && ENT_PWD)) throw "Spécifiez vos identifiants";

(async () => {
    if (!data.webhooks) throw "No webhooks set";

    const browser = await puppeteer.launch({ headless: "new" })
    const page = await browser.newPage()

    await page.goto("https://ent.iledefrance.fr/actualites")

    InputEnterValue(page, '[name="email"]', ENT_ID)
    InputEnterValue(page, '[name="password"]', ENT_PWD);

    await (await page.waitForSelector("button.flex-magnet-bottom-right")).evaluate((el) => el.click())

    await page.waitForSelector(".cell.eleven")

    const menus = await page.evaluate(() => {
        const menus_cantine: Attatchment[] = []
        const articles = document.querySelectorAll(".cell.eleven")
        articles.forEach(el => {
            el.querySelector("h2").click()
            const metadata = (el.querySelector("em.metadata") as HTMLEmbedElement).innerText
            const attachments = el.querySelectorAll(".attachments a")
            attachments?.forEach((att: HTMLAnchorElement) => {
                const attName = att.innerText
                if (attName.includes(".pdf") && attName.toLocaleLowerCase().includes("menu")) {
                    menus_cantine.push({
                        name: attName,
                        link: att.href,
                        metadata
                    })
                }
            })
        })
        return menus_cantine
    })

    menus.forEach(async menu => {
        const res = await fetch(menu.link)
        console.log(res);
    })

    for (const webhook_url of data.webhooks) {
        continue;
        const webhook = new Webhook(webhook_url)
        webhook.send({
            username: "Le Menu de la Cantine",
            embeds: [
                {
                    title: "test",
                    description: "ceci est un test",
                    fields: [{ name: "name", value: "value" }],
                    color: parseInt("00ff7b", 16)
                }
            ],
        })
    }

    await browser.close()

    fs.writeFileSync(data_path, JSON.stringify(data, null, 4));
})()