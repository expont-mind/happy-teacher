-- Trigger: 3 Lessons Completed
-- Fires after a record is inserted into child_progress
CREATE OR REPLACE FUNCTION handle_lesson_completion_trigger()
RETURNS TRIGGER AS $$
DECLARE
  v_parent_id UUID;
  v_child_name TEXT;
  v_lesson_count INT;
  v_settings JSONB;
BEGIN
  -- Get child details and parent_id
  SELECT parent_id, name INTO v_parent_id, v_child_name
  FROM children
  WHERE id = NEW.child_id;

  -- Count total lessons for this child
  SELECT COUNT(*) INTO v_lesson_count
  FROM child_progress
  WHERE child_id = NEW.child_id;

  -- If count is multiple of 3
  IF v_lesson_count > 0 AND v_lesson_count % 3 = 0 THEN
    -- Always insert in-app notification regardless of email setting
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      v_parent_id,
      'lesson_report',
      'Явцын тайлан (3 хичээл)',
      v_child_name || ' 3 хичээл амжилттай дуусгалаа!'
    );
    
    -- NOTE: If we had an actual email service, we would check the setting here:
    -- SELECT raw_user_meta_data->'notification_settings' INTO v_settings ...
    -- IF (v_settings->>'gmail')::BOOLEAN IS TRUE THEN ... send_email() ... END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_lesson_complete ON child_progress;
CREATE TRIGGER on_lesson_complete
  AFTER INSERT ON child_progress
  FOR EACH ROW
  EXECUTE FUNCTION handle_lesson_completion_trigger();


-- Function: Check Inactivity (Run daily via cron)
CREATE OR REPLACE FUNCTION check_inactivity_reminders()
RETURNS VOID AS $$
DECLARE
  child_rec RECORD;
BEGIN
  FOR child_rec IN
    SELECT c.id, c.name, c.parent_id, c.last_active_at
    FROM children c
    WHERE c.last_active_at < NOW() - INTERVAL '2 days'
  LOOP
    -- Always insert in-app notification regardless of SMS setting
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      child_rec.parent_id,
      'inactivity_reminder',
      'Хичээлээ санаж байна уу?',
      child_rec.name + ' сүүлийн 2 өдөр хичээл хийсэнгүй.'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Function: Weekly Report (Run every Monday via cron)
CREATE OR REPLACE FUNCTION generate_weekly_reports()
RETURNS VOID AS $$
DECLARE
  parent_rec RECORD;
BEGIN
  FOR parent_rec IN SELECT id, raw_user_meta_data FROM auth.users LOOP
    -- Always insert in-app notification regardless of report setting
    INSERT INTO notifications (user_id, type, title, message)
    VALUES (
      parent_rec.id,
      'weekly_report',
      'Долоо хоногийн тайлан',
      'Таны хүүхдүүдийн долоо хоногийн явцын тайлан бэлэн боллоо.'
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
