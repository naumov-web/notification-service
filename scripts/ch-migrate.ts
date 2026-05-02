import { createClient } from '@clickhouse/client';
import fs from 'fs';

const client = createClient({
    url: process.env.CLICKHOUSE_URL!,
});

async function run() {
    const sql = fs.readFileSync(
        'libs/analytics/migrations/001_create_analytics_events.sql',
        'utf-8',
    );

    await client.command({ query: sql });

    console.log('ClickHouse migration applied');
}

run();