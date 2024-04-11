import type { NextApiRequest, NextApiResponse } from "next";

export default function handler(req: NextApiRequest, res: NextApiResponse)  {
    res.status(200).json({
        events: [
            {
                name: "HashCode",
                type: "hackathon",
                date: new Date('09/11/2002').toISOString().slice(0, 10)
            },
            {
                name: "MarkdownMania",
                type: "workshop",
                date: new Date('09/11/2002').toISOString().slice(0, 10)
            },
            {
                name: "AI in Engineering",
                type: "seminar",
                date: new Date('09/11/2002').toISOString().slice(0, 10)
            }
        ]
    });
}