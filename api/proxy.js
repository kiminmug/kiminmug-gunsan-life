export default async function handler(req, res) {
    const { url } = req.query;

    if (!url) {
        return res.status(400).json({ error: 'URL parameter is required' });
    }

    try {
        const response = await fetch(url);
        if (!response.ok) {
            return res.status(response.status).json({ error: 'Failed to fetch target URL' });
        }

        const contentType = response.headers.get('content-type');
        const text = await response.text();

        res.setHeader('Access-Control-Allow-Credentials', true);
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
        res.setHeader(
            'Access-Control-Allow-Headers',
            'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
        );

        res.setHeader('Content-Type', contentType || 'text/xml');
        res.status(200).send(text);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
