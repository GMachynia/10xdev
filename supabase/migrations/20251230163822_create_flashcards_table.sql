-- migration: create flashcards table
-- purpose: create the main flashcards table with rls policies and triggers
-- affected tables: flashcards (new table)
-- special considerations:
--   - table references auth.users(id) which is managed by supabase auth
--   - rls is enabled with granular policies for anon and authenticated roles
--   - trigger automatically sets user_id to prevent manipulation

-- create the flashcards table
-- this table stores educational flashcards created by users
create table flashcards (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null references auth.users(id) on delete cascade,
    source_text varchar(200) not null check (char_length(source_text) <= 200),
    translation text
);

-- create index on user_id for performance optimization
-- this index optimizes queries filtered by user and is required for efficient rls
create index idx_flashcards_user_id on flashcards(user_id);

-- create function to automatically set user_id
-- this function is called by the trigger before insert or update
-- it ensures user_id is always set to the authenticated user's id
-- security definer allows access to auth.uid() in trigger context
-- note: function is created before trigger that uses it
create or replace function set_flashcards_user_id()
returns trigger as $$
begin
    new.user_id := auth.uid();
    return new;
end;
$$ language plpgsql security definer;

-- enable row level security on the flashcards table
-- rls must be enabled before creating policies
-- rls ensures users can only access their own flashcards
alter table flashcards enable row level security;

-- rls policy: select for anonymous users
-- anonymous users cannot read any flashcards
create policy flashcards_select_policy_anon on flashcards
    for select
    to anon
    using (false);

-- rls policy: select for authenticated users
-- authenticated users can only read their own flashcards
create policy flashcards_select_policy_authenticated on flashcards
    for select
    to authenticated
    using (user_id = auth.uid());

-- rls policy: insert for anonymous users
-- anonymous users cannot create flashcards
create policy flashcards_insert_policy_anon on flashcards
    for insert
    to anon
    with check (false);

-- rls policy: insert for authenticated users
-- authenticated users can only create flashcards for themselves
-- user_id must equal the authenticated user's id
create policy flashcards_insert_policy_authenticated on flashcards
    for insert
    to authenticated
    with check (user_id = auth.uid());

-- rls policy: update for anonymous users
-- anonymous users cannot update flashcards
create policy flashcards_update_policy_anon on flashcards
    for update
    to anon
    using (false)
    with check (false);

-- rls policy: update for authenticated users
-- authenticated users can only update their own flashcards
-- using clause controls access to existing rows
-- with check ensures user_id remains unchanged after update
create policy flashcards_update_policy_authenticated on flashcards
    for update
    to authenticated
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

-- rls policy: delete for anonymous users
-- anonymous users cannot delete flashcards
create policy flashcards_delete_policy_anon on flashcards
    for delete
    to anon
    using (false);

-- rls policy: delete for authenticated users
-- authenticated users can only delete their own flashcards
-- hard delete - flashcard is permanently removed from database
create policy flashcards_delete_policy_authenticated on flashcards
    for delete
    to authenticated
    using (user_id = auth.uid());

-- create trigger to automatically set user_id
-- this trigger fires before insert or update operations
-- it prevents users from accidentally or intentionally setting incorrect user_id
-- also prevents changing user_id during update operations
-- note: trigger is created after function and table exist
create trigger set_flashcards_user_id
    before insert or update on flashcards
    for each row
    execute function set_flashcards_user_id();

