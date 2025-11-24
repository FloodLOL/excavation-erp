# Configuration des photos de factures

Cette fonctionnalité permet d'ajouter des photos de factures aux dépenses de votre ERP.

## Étapes d'installation

### 1. Mettre à jour le schéma de la base de données

Si votre base de données existe déjà, exécutez le fichier de migration dans votre Supabase SQL Editor:

```sql
-- Fichier: migration-add-receipt-image.sql
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS receipt_image TEXT;
```

Si vous créez une nouvelle base de données, le schéma dans `database-schema.sql` contient déjà cette colonne.

### 2. Configurer le stockage Supabase

**IMPORTANT:** Créez le bucket via l'interface graphique (pas via SQL):

1. Allez dans votre tableau de bord Supabase
2. Cliquez sur **Storage** dans le menu latéral
3. Cliquez sur **New bucket**
4. Remplissez les informations:
   - **Name:** `expense-receipts`
   - **Public bucket:** ✅ Cochez cette case (IMPORTANT!)
   - **File size limit:** 5 MB (optionnel)
   - **Allowed MIME types:** image/* (optionnel)
5. Cliquez sur **Create bucket**

### 3. Configurer les politiques (Optionnel mais recommandé)

Pour limiter qui peut uploader des images:

1. Dans Storage, cliquez sur le bucket `expense-receipts`
2. Allez dans l'onglet **Policies**
3. Cliquez sur **New policy**
4. Créez une politique pour INSERT:
   - **Policy name:** `Users can upload receipt images`
   - **Target roles:** `authenticated`
   - **WITH CHECK expression:**
     ```sql
     bucket_id = 'expense-receipts'
     ```
5. Cliquez sur **Review** puis **Save policy**

**Note:** Si le bucket est public, les images seront accessibles par tous (lecture), mais seuls les utilisateurs authentifiés pourront uploader.

### 4. Vérifier la configuration

1. Le bucket `expense-receipts` doit apparaître dans la liste
2. L'icône cadenas doit être **ouvert** (bucket public)
3. Testez l'upload en ajoutant une dépense avec une photo

## Utilisation

### Ajouter une photo de facture

1. Ouvrez la page **Dépenses**
2. Cliquez sur **Ajouter une dépense**
3. Remplissez les informations de la dépense
4. Dans la section "Photo de la facture":
   - Cliquez sur **Prendre une photo** pour utiliser la caméra (mobile)
   - Cliquez sur **Choisir une image** pour sélectionner un fichier existant
5. L'aperçu s'affiche immédiatement
6. Cliquez sur **Créer** pour enregistrer

### Voir une photo de facture

1. Dans le tableau des dépenses, cherchez la colonne **Facture**
2. Si une dépense a une photo, une icône œil (👁️) apparaît
3. Cliquez sur l'icône pour voir la photo en grand
4. Cliquez en dehors de l'image ou sur le X pour fermer

### Modifier/Supprimer une photo

1. Cliquez sur **Modifier** pour une dépense
2. Pour remplacer la photo: cliquez sur le X rouge, puis ajoutez une nouvelle photo
3. Pour supprimer la photo: cliquez sur le X rouge et enregistrez sans ajouter de nouvelle photo

## Limitations

- Taille maximale: 5 MB par image
- Formats acceptés: tous les formats d'image (JPEG, PNG, etc.)
- Les images sont stockées publiquement dans Supabase Storage

## Dépannage

### Erreur "must be owner of table objects"
Cette erreur se produit si vous essayez d'exécuter des commandes SQL pour créer le bucket. **Solution:** Créez le bucket via l'interface graphique Supabase (voir étape 2 ci-dessus).

### Erreur "new row violates row-level security policy"
Cette erreur signifie que les politiques RLS ne sont pas correctement configurées. **Solution:** Exécutez le fichier `fix-rls-policies.sql` dans votre Supabase SQL Editor pour configurer toutes les politiques RLS nécessaires (Storage + Database).

### Erreur lors de l'upload
- Vérifiez que le bucket `expense-receipts` existe dans Supabase Storage
- Vérifiez que le bucket est configuré comme **public** (icône cadenas ouvert)
- Vérifiez que vous êtes bien connecté (authentifié)

### L'image ne s'affiche pas
- Vérifiez que l'URL de l'image est correcte dans la base de données
- Vérifiez que le bucket est public
- Ouvrez la console du navigateur pour voir les erreurs éventuelles

### La caméra ne s'ouvre pas
- Sur mobile: vérifiez que le navigateur a accès à la caméra
- Sur desktop: utilisez plutôt "Choisir une image"
- Certains navigateurs nécessitent HTTPS pour accéder à la caméra
