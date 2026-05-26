-- Tighten rental request fields
CREATE OR REPLACE FUNCTION public.protect_rental_request_fields()
Returns trigger AS $$
BEGIN
  -- If the user is authenticated (not service role)
  IF current_user = 'authenticator' THEN
    -- If the current user is NOT the renter (so it's the owner)
    IF auth.uid() != old.renter_id OR old.renter_id IS NULL THEN
      -- The owner can ONLY update owner_response_notes
      -- Revert any other changes they tried to make
      IF new.status IS DISTINCT FROM old.status THEN new.status = old.status; END IF;
      IF new.start_date IS DISTINCT FROM old.start_date THEN new.start_date = old.start_date; END IF;
      IF new.end_date IS DISTINCT FROM old.end_date THEN new.end_date = old.end_date; END IF;
      IF new.renter_name IS DISTINCT FROM old.renter_name THEN new.renter_name = old.renter_name; END IF;
      IF new.renter_phone IS DISTINCT FROM old.renter_phone THEN new.renter_phone = old.renter_phone; END IF;
      IF new.renter_email IS DISTINCT FROM old.renter_email THEN new.renter_email = old.renter_email; END IF;
      IF new.needs_driver IS DISTINCT FROM old.needs_driver THEN new.needs_driver = old.needs_driver; END IF;
      IF new.needs_delivery IS DISTINCT FROM old.needs_delivery THEN new.needs_delivery = old.needs_delivery; END IF;
      IF new.delivery_location IS DISTINCT FROM old.delivery_location THEN new.delivery_location = old.delivery_location; END IF;
      IF new.message IS DISTINCT FROM old.message THEN new.message = old.message; END IF;
      IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN new.admin_notes = old.admin_notes; END IF;
    ELSE
      -- It IS the renter. They cannot change admin notes or owner response notes.
      IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN new.admin_notes = old.admin_notes; END IF;
      IF new.owner_response_notes IS DISTINCT FROM old.owner_response_notes THEN new.owner_response_notes = old.owner_response_notes; END IF;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Tighten listing request fields
CREATE OR REPLACE FUNCTION public.protect_listing_request_fields()
Returns trigger AS $$
BEGIN
  -- If the user is authenticated (not service role)
  IF current_user = 'authenticator' THEN
    -- If the current user is NOT the requester (so it's the owner)
    IF auth.uid() != old.requester_id OR old.requester_id IS NULL THEN
      -- The owner can ONLY update owner_response_notes
      IF new.status IS DISTINCT FROM old.status THEN new.status = old.status; END IF;
      IF new.requester_name IS DISTINCT FROM old.requester_name THEN new.requester_name = old.requester_name; END IF;
      IF new.requester_phone IS DISTINCT FROM old.requester_phone THEN new.requester_phone = old.requester_phone; END IF;
      IF new.requester_email IS DISTINCT FROM old.requester_email THEN new.requester_email = old.requester_email; END IF;
      IF new.request_type IS DISTINCT FROM old.request_type THEN new.request_type = old.request_type; END IF;
      IF new.message IS DISTINCT FROM old.message THEN new.message = old.message; END IF;
      IF new.preferred_contact_method IS DISTINCT FROM old.preferred_contact_method THEN new.preferred_contact_method = old.preferred_contact_method; END IF;
      IF new.preferred_viewing_date IS DISTINCT FROM old.preferred_viewing_date THEN new.preferred_viewing_date = old.preferred_viewing_date; END IF;
      IF new.budget_amount IS DISTINCT FROM old.budget_amount THEN new.budget_amount = old.budget_amount; END IF;
      IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN new.admin_notes = old.admin_notes; END IF;
    ELSE
      -- It IS the requester
      IF new.admin_notes IS DISTINCT FROM old.admin_notes THEN new.admin_notes = old.admin_notes; END IF;
      IF new.owner_response_notes IS DISTINCT FROM old.owner_response_notes THEN new.owner_response_notes = old.owner_response_notes; END IF;
    END IF;
  END IF;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Refresh schema cache if needed
NOTIFY pgrst, 'reload schema';
