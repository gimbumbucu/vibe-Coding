CREATE TABLE public.todos (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    title text NOT NULL,
    description text,
    is_completed boolean DEFAULT false,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- RLS (Row Level Security) 해제하여 누구나 읽고 쓸 수 있도록 설정
ALTER TABLE public.todos DISABLE ROW LEVEL SECURITY;
