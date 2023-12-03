import fs from "node:fs"
import path from 'node:path';
import { InputEnterValue, Webhook } from "./lib";
import puppeteer from "puppeteer";
import 'dotenv/config';

interface Data {
    last_update: number
    webhooks: string[]
}

const data_path = path.join(__dirname, "../data.json");

let data = JSON.parse(fs.readFileSync(data_path).toString()) as Partial<Data>
let { ENT_ID, ENT_PWD } = process.env;
console.log(ENT_ID, ENT_PWD)

if (!(ENT_ID && ENT_PWD)) throw "Spécifiez vos identifiants";

(async () => {
    if (!data.webhooks) throw "No webhooks set";

    const browser = await puppeteer.launch({ headless: false })
    const page = await browser.newPage()

    await page.goto("https://ent.iledefrance.fr/actualites")

    InputEnterValue(page, '[name="email"]', ENT_ID)
    InputEnterValue(page, '[name="password"]', ENT_PWD)

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

    fs.writeFileSync(data_path, JSON.stringify(data, null, 4));
})()