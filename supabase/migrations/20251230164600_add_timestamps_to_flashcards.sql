-- migration: add timestamps to flashcards table
-- purpose: add created_at and updated_at columns to flashcards table
-- affected tables: flashcards (add columns)
-- special considerations:
--   - adds timestamp columns with default values
--   - updates trigger function to automatically manage timestamps
--   - preserves existing data by setting default values for existing rows

-- add created_at column to flashcards table
-- this column stores the timestamp when the flashcard was created
alter table flashcards
    add column created_at timestamptz not null default now();

-- add updated_at column to flashcards table
-- this column stores the timestamp when the flashcard was last updated
alter table flashcards
    add column updated_at timestamptz not null default now();

-- update function to automatically set user_id and manage timestamps
-- this function is called by the trigger before insert or update
-- it ensures user_id is always set to the authenticated user's id
-- it also automatically updates updated_at timestamp on update operations
-- security definer allows access to auth.uid() in trigger context
create or replace function set_flashcards_user_id()
returns trigger as $$
begin
    new.user_id := auth.uid();
    -- automatically set created_at on insert, updated_at on update
    if tg_op = 'INSERT' then
        new.created_at := now();
        new.updated_at := now();
    elsif tg_op = 'UPDATE' then
        new.updated_at := now();
        -- preserve original created_at value
        new.created_at := old.created_at;
    end if;
    return new;
end;
$$ language plpgsql security definer;

