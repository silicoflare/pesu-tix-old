import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse)  {
    res.status(200).json({
        events: [
            {
                name: "HashCode",
                type: "hackathon"
            },
            {
                name: "MarkdownMania",
                type: "workshop"
            },
            {
                name: "AI in Engineering",
                type: "seminar"
            }
        ]
    });
}