-- Table pour les membres du comité
CREATE TABLE IF NOT EXISTS tyla_committee_members (
  id BIGSERIAL PRIMARY KEY,
  initials VARCHAR(4) NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(50) NOT NULL,
  display_order INTEGER DEFAULT 0,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insertion des membres initiaux
INSERT INTO tyla_committee_members (initials, name, role, email, phone, display_order) VALUES
('TM', 'Tatiana Monteiro', 'Présidente', 'presidente@tylafrica.com', '+229 XX XX XX XX', 1),
('MT', 'Myriam Tsumbu Nzanzala', 'Vice-Présidente', 'vice-presidente@tylafrica.com', '+229 XX XX XX XX', 2),
('IK', 'Ismael Kane', 'Trésorier', 'tresorier@tylafrica.com', '+229 XX XX XX XX', 3),
('ET', 'Eunice Tchibozo', 'Resp. Projet et Développement', 'projet@tylafrica.com', '+229 XX XX XX XX', 4),
('BO', 'Benedicte Okonda', 'Secrétaire Générale', 'secretaire@tylafrica.com', '+229 XX XX XX XX', 5),
('JL', 'Julia Lavenette', 'Responsable Média', 'media@tylafrica.com', '+229 XX XX XX XX', 6);

-- Index pour optimiser les requêtes
CREATE INDEX IF NOT EXISTS idx_committee_active ON tyla_committee_members(active);
CREATE INDEX IF NOT EXISTS idx_committee_order ON tyla_committee_members(display_order);