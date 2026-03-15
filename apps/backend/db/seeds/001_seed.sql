INSERT INTO users (id, email, password_hash, display_name, role)
VALUES
  ('00000000-0000-0000-0000-000000000001', 'admin@quiz.local', 'demo', 'Admin', 'admin'),
  ('00000000-0000-0000-0000-000000000002', 'host@quiz.local', 'demo', 'Host', 'moderator'),
  ('00000000-0000-0000-0000-000000000003', 'player@quiz.local', 'demo', 'Player One', 'player')
ON CONFLICT (id) DO NOTHING;

INSERT INTO rooms (id, code, title, owner_id, status)
VALUES
  ('10000000-0000-0000-0000-000000000001', 'ROOM01', 'Demo Room', '00000000-0000-0000-0000-000000000002', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO room_members (id, room_id, user_id, is_moderator)
VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', TRUE),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', FALSE)
ON CONFLICT (id) DO NOTHING;

INSERT INTO quiz_packs (id, author_id, title, description, difficulty)
VALUES
  ('30000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'General Knowledge Starter', 'Warm-up pack for broad knowledge', 'easy'),
  ('30000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'History Highlights', 'World history milestones', 'medium'),
  ('30000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000002', 'Science Quickfire', 'Physics, chemistry and biology', 'medium'),
  ('30000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000002', 'Movies and Pop Culture', 'Famous movies and celebrities', 'easy'),
  ('30000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000002', 'Math and Logic', 'Numbers and puzzles', 'hard')
ON CONFLICT (id) DO NOTHING;

INSERT INTO questions (id, quiz_pack_id, prompt, type, options, correct_answer, explanation, points)
VALUES
  ('40000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'What is the capital of France?', 'single_choice', '["Berlin","Madrid","Paris","Rome"]', '"Paris"', 'Paris is the capital city of France.', 1),
  ('40000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'In which year did the Berlin Wall fall?', 'single_choice', '["1987","1989","1991","1993"]', '"1989"', 'The fall of the Berlin Wall happened in November 1989.', 2),
  ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000003', 'What is H2O commonly known as?', 'single_choice', '["Hydrogen","Salt","Water","Oxygen"]', '"Water"', 'H2O is the molecular formula for water.', 1),
  ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', 'Who directed the movie "Inception"?', 'single_choice', '["Christopher Nolan","James Cameron","Steven Spielberg","Ridley Scott"]', '"Christopher Nolan"', 'Inception was directed by Christopher Nolan.', 2),
  ('40000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000005', 'What is 12 x 8?', 'single_choice', '["86","92","96","102"]', '"96"', '12 multiplied by 8 equals 96.', 1)
ON CONFLICT (id) DO NOTHING;
