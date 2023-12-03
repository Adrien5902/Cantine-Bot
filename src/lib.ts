import { Page } from "puppeteer";

interface WebhookBody {
    content: string,
    username: string,
    avatar_url: string,
    embeds: Embed[],
}

export class Webhook {
    url: string
    constructor(url: string) {
        this.url = url
    }

    async send(body: Partial<WebhookBody> | string) {
        if (typeof body == "string") body = { content: body }

        const res = await fetch(this.url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(body)
        })
        return res.body
    }
}

interface EmbedFields {
    name: string
    value: string
    inline?: boolean
}

interface Embed {
    title?: string
    type?: "rich",
    description?: string
    color?: number
    fields?: EmbedFields[]
}

export const InputEnterValue = (page: Page, selector: string, new_value: string) => new Promise(resolve => {
    page.waitForSelector(selector)
        .then((handler) =>
            handler?.evaluate((el, new_value) => {
                (el as HTMLInputElement).value = new_value
            }, new_value).then(resolve)
        )
})