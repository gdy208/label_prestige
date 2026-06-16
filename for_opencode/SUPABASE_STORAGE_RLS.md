# Supabase Storage — RLS Policies

Bucket `documents` actuellement en mode **public** (lecture publique, écriture via clé anon).

## État actuel

- **SELECT** (lecture/téléchargement) : public — tout le monde peut lire
- **INSERT / DELETE** (upload/suppression) : autorisé via la clé anon — **pas de vraie sécurité**

L'upload est protégé côté UI (formulaire visible uniquement si connecté), mais n'importe qui possédant la clé anon (publique, embarquée dans le frontend) peut uploader.

## Recommandation production

### 1. Basculer vers Firebase Storage

Firebase Storage s'intègre nativement avec Firebase Auth (déjà en place). Les règles peuvent checker `request.auth.uid` :

```firebase-storage
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null
        && firestore.exists(/databases/(default)/documents/users/$(request.auth.uid))
        && firestore.get(/databases/(default)/documents/users/$(request.auth.uid)).data.active == true;
    }
  }
}
```

### 2. Ou RLS Supabase (si utilisation Supabase Auth)

```sql
-- Lecture publique
CREATE POLICY "Public SELECT"
ON storage.objects FOR SELECT
USING (bucket_id = 'documents');

-- Upload si authentifié (nécessite Supabase Auth)
CREATE POLICY "Auth INSERT"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);

-- Delete si authentifié
CREATE POLICY "Auth DELETE"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'documents'
  AND auth.role() = 'authenticated'
);
```

**Note :** Le projet utilise Firebase Auth, pas Supabase Auth. Les politiques Supabase basées sur `auth.role()` ne fonctionneront pas sans migration.

### Solution actuelle acceptable

Pour un site vitrine sans données sensibles, laisser le bucket en public pour les lectures, et compter sur le gating UI pour les écritures. La clé anon est publique de toute façon dans une SPA.
