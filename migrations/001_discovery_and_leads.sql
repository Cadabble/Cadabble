BEGIN;

CREATE TABLE service_categories (
  id text PRIMARY KEY, name text NOT NULL, risk_level text NOT NULL CHECK (risk_level IN ('standard','regulated','sensitive','review')),
  active boolean NOT NULL DEFAULT true, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE service_category_aliases (
  category_id text NOT NULL REFERENCES service_categories(id), alias text NOT NULL, locale text NOT NULL DEFAULT 'en-CA',
  PRIMARY KEY (category_id, alias, locale)
);
CREATE TABLE service_requests (
  id uuid PRIMARY KEY, raw_query text NOT NULL CHECK (length(raw_query) BETWEEN 2 AND 200), category_id text,
  requested_location text NOT NULL, created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE recommended_provider_leads (
  id uuid PRIMARY KEY, business_name text NOT NULL, category_id text NOT NULL, service_area text, public_website text,
  public_phone text, public_email text, source_url text NOT NULL, verification_status text NOT NULL,
  membership_status text NOT NULL DEFAULT 'not_affiliated', outreach_status text NOT NULL DEFAULT 'not_contacted',
  status text NOT NULL DEFAULT 'discovered', version integer NOT NULL DEFAULT 1, discovered_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (category_id, source_url)
);
CREATE TABLE provider_lead_demands (
  lead_id uuid NOT NULL REFERENCES recommended_provider_leads(id), request_id uuid NOT NULL REFERENCES service_requests(id),
  created_at timestamptz NOT NULL DEFAULT now(), PRIMARY KEY (lead_id, request_id)
);
CREATE TABLE lead_audit_events (
  id uuid PRIMARY KEY, lead_id uuid NOT NULL REFERENCES recommended_provider_leads(id), event_type text NOT NULL,
  actor_id text NOT NULL, metadata jsonb NOT NULL DEFAULT '{}', occurred_at timestamptz NOT NULL DEFAULT now()
);
REVOKE UPDATE, DELETE ON lead_audit_events FROM PUBLIC;
COMMIT;
