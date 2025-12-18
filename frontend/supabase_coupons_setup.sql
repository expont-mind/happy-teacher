-- Create coupons table
CREATE TABLE IF NOT EXISTS coupons (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  cost INTEGER NOT NULL,
  image TEXT,
  color TEXT,
  code_prefix TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE coupons ENABLE ROW LEVEL SECURITY;

-- Create policy to allow read access for all users
DROP POLICY IF EXISTS "Enable read access for all users" ON coupons;
CREATE POLICY "Enable read access for all users" ON coupons
  FOR SELECT USING (true);

-- Insert initial data
INSERT INTO coupons (id, title, description, cost, image, color, code_prefix)
VALUES
  ('game_time_30', 'Тоглоомын цаг', '30 минут тоглох эрх', 100, '/svg/Joystick.svg', 'bg-blue-500', 'GAME'),
  ('ice_cream', 'Зайрмаг', 'Дуртай зайрмагаа авах эрх', 300, '/svg/IceCream.svg', 'bg-pink-500', 'ICE'),
  ('movie_night', 'Кино үзэх', 'Гэр бүлээрээ кино үзэх эрх', 500, '/svg/Popcorn.svg', 'bg-orange-500', 'MOVIE'),
  ('toy_small', 'Жижиг тоглоом', '10,000₮ дотор тоглоом авах', 1000, '/svg/Toy.svg', 'bg-purple-500', 'TOY')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  cost = EXCLUDED.cost,
  image = EXCLUDED.image,
  color = EXCLUDED.color,
  code_prefix = EXCLUDED.code_prefix;
