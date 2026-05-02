import { Provider } from '@nestjs/common';
import { createClient } from '@clickhouse/client';

export const CLICKHOUSE_CLIENT = 'CLICKHOUSE_CLIENT';

export const ClickHouseProvider: Provider = {
    provide: CLICKHOUSE_CLIENT,
    useFactory: () => {
        return createClient({
            url: process.env.CLICKHOUSE_URL || 'http://clickhouse:8123',
            database: 'analytics',
        });
    },
};