CREATE TABLE analytics_events
(
    event_time DateTime,
    event_date Date MATERIALIZED toDate(event_time),

    notification_id UUID,
    delivery_id UUID,

    user_id UUID,
    event_type String,

    channel String,

    status String,

    is_retry UInt8
)
    ENGINE = MergeTree
PARTITION BY event_date
ORDER BY (event_time, notification_id);