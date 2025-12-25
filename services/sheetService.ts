import { LocalEvent } from '../types';

const SHEET_ID = '2PACX-1vRqDTUAjeV0bfly2cb9SHiqwbWZZrFRCR-5zx0T1xIIJVV4YaeFR6pVc_g0q6tnhEXFAGx3OQ_7h5Ep';
const CSV_URL = `https://docs.google.com/spreadsheets/d/e/${SHEET_ID}/pub?output=csv`;

export const fetchSheetEvents = async (): Promise<LocalEvent[]> => {
    try {
        const response = await fetch(CSV_URL);
        if (!response.ok) throw new Error('Failed to fetch sheet');
        const text = await response.text();
        return parseCSV(text);
    } catch (error) {
        console.warn("Sheet fetch failed, using fallback:", error);
        return [];
    }
};

const parseCSV = (csvText: string): LocalEvent[] => {
    const lines = csvText.trim().split('\n');
    const headers = lines[0].split(','); // Assuming standard csv headers for now, but better to skip row 0

    const events: LocalEvent[] = [];

    // Custom CSV parser to handle quotes
    const parseLine = (line: string) => {
        const result = [];
        let start = 0;
        let inQuotes = false;
        for (let i = 0; i < line.length; i++) {
            if (line[i] === '"') {
                inQuotes = !inQuotes;
            } else if (line[i] === ',' && !inQuotes) {
                let field = line.substring(start, i).trim();
                if (field.startsWith('"') && field.endsWith('"')) {
                    field = field.substring(1, field.length - 1).replace(/""/g, '"');
                }
                result.push(field);
                start = i + 1;
            }
        }
        let lastField = line.substring(start).trim();
        if (lastField.startsWith('"') && lastField.endsWith('"')) {
            lastField = lastField.substring(1, lastField.length - 1).replace(/""/g, '"');
        }
        result.push(lastField);
        return result;
    };

    for (let i = 1; i < lines.length; i++) {
        const cols = parseLine(lines[i]);
        if (cols.length < 3) continue;

        const rawDate = cols[0];
        const rawTitleDesc = cols[1];
        const location = cols[2];
        const contact = cols[3] || '';

        // Split Title and Description
        // Format: "Title └ Description"
        const [title, ...descParts] = rawTitleDesc.split('└');
        const description = descParts.join(' ').trim();

        // Auto-categorize
        let type: 'Festival' | 'Culture' | 'Notice' = 'Notice';
        const keywordString = (title + description + location).toLowerCase();

        if (keywordString.match(/전시|초대전|갤러리|그림/)) {
            type = 'Culture'; // Exhibition
        } else if (keywordString.match(/공연|콘서트|뮤지컬|음악회|연주회|영화/)) {
            type = 'Festival'; // Performance (using Festival type for now, or add new)
        } else {
            type = 'Notice'; // General
        }

        // Clean up contact info (remove trailing citation numbers like ' 1', ' [12]')
        const cleanContact = (contact || '').replace(/\s*\[?\d+\]?$/, '').trim();

        events.push({
            id: `sheet-${i}`,
            title: title.trim(),
            description: description || title.trim(),
            dateRange: rawDate,
            location: location,
            type: type,
            contact: cleanContact
        });
    }
    return events;
};
