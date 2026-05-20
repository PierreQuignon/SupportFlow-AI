# CLAUDE.md — SupportFlow AI

> Fichier de référence technique et fonctionnel pour le développement de SupportFlow AI.
> À lire en priorité avant de commencer à coder.
> **Valable pour les développeurs humains et pour Claude Code.**

---

## Table des matières

1. [Vision produit](#1-vision-produit)
2. [Stack technique](#2-stack-technique)
3. [Architecture du projet](#3-architecture-du-projet)
4. [Modèle de données](#4-modèle-de-données)
5. [Spécifications fonctionnelles MVP](#5-spécifications-fonctionnelles-mvp)
6. [Intégrations externes](#6-intégrations-externes)
7. [Pipeline IA](#7-pipeline-ia)
8. [UI/UX — Design system](#8-uiux--design-system)
9. [Plan de développement](#9-plan-de-développement)
10. [Infrastructure & déploiement](#10-infrastructure--déploiement)
11. [Règles de développement & bonnes pratiques](#11-règles-de-développement--bonnes-pratiques)
12. [Sécurité](#12-sécurité)

---

## 1. Vision produit

**SupportFlow AI** est une plateforme interne qui automatise le traitement des emails clients grâce à l'IA.

### Ce qu'elle fait

- Récupère automatiquement les emails depuis Gmail
- Analyse les demandes avec Claude (résumé, catégorie, priorité, réponse suggérée)
- Présente les suggestions à un agent humain pour validation
- Envoie les réponses validées via Gmail
- Notifie sur Slack pour les cas critiques
- Exporte les données vers Google Sheets pour le reporting

### Persona principal

**Agent support PME**
- Objectifs : traiter vite, prioriser les urgences, éviter les oublis, gagner du temps sur les réponses répétitives
- Problèmes : trop d'emails, réponses redondantes, manque de suivi, perte de contexte

---

## 2. Stack technique

| Couche | Choix | Justification |
|---|---|---|
| Frontend | Next.js 14 (App Router) + TypeScript | SSR natif, routing file-based, DX rapide |
| UI | Material UI v6 | Composants prêts, thémable, cohérent |
| Data fetching | **React Query** (`@tanstack/react-query`) | Cache serveur, mutations, état async — obligatoire |
| Formulaires | **React Hook Form** + `zod` | Performant, validation déclarative, zéro re-render |
| Backend | NestJS + TypeScript | Architecture modulaire, DI natif, scalable |
| ORM | Prisma | DX excellente, migrations simples, type-safe |
| Base de données | PostgreSQL | Robuste, libre, Docker local → Supabase prod |
| Auth | NextAuth.js (Google OAuth) | Intègre Gmail OAuth, zero-cost |
| IA | Anthropic Claude API (`claude-sonnet-4-20250514`) | Puissant, API simple, coût faible |
| Intégrations | Gmail API, Slack Webhooks, Google Sheets API | Via OAuth Google existant |
| Infra dev | Docker Compose | Environnement local reproductible |
| Infra prod | Vercel (frontend) + Railway/Render (backend) | Free tiers suffisants pour démo |

**Coût estimé : ~0–15 €/mois** selon le trafic.

---

## 3. Architecture du projet

### Frontend `/src`

```
src/
├── app/                              # Next.js App Router
│   ├── (auth)/
│   │   └── login/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── inbox/
│   │   │   ├── page.tsx
│   │   │   └── [id]/
│   │   │       └── page.tsx
│   └── api/                          # Route handlers (webhooks, auth callbacks)
│
├── features/                         # Feature-based — une feature = un dossier autonome
│   ├── inbox/
│   │   ├── components/
│   │   │   ├── EmailList.tsx
│   │   │   ├── EmailRow.tsx
│   │   │   └── StatusBadge.tsx
│   │   ├── hooks/
│   │   │   ├── useEmails.ts
│   │   │   └── useEmailFilters.ts
│   │   ├── services/
│   │   │   └── inbox.service.ts      # Appels API backend
│   │   └── types.ts
│   │
│   ├── email-detail/
│   │   ├── components/
│   │   │   ├── ConversationThread.tsx
│   │   │   ├── AISummary.tsx
│   │   │   └── AIReplyEditor.tsx
│   │   ├── hooks/
│   │   │   └── useEmailDetail.ts
│   │   └── types.ts
│   │
│   └── notifications/
│       ├── components/
│       └── hooks/
│
└── shared/
    ├── components/                   # Composants réutilisables cross-features
    │   ├── Layout.tsx
    │   ├── Sidebar.tsx
    │   ├── TopBar.tsx
    │   └── Loader.tsx
    ├── lib/
    │   ├── axios.ts                  # Instance axios configurée
    │   └── formatters.ts
    └── theme/
        └── muiTheme.ts               # Thème MUI custom
```

### Backend `/src`

```
src/
├── modules/
│   ├── emails/
│   │   ├── emails.controller.ts
│   │   ├── emails.service.ts
│   │   ├── emails.module.ts
│   │   └── dto/
│   │       ├── create-email.dto.ts
│   │       └── update-email.dto.ts
│   │
│   ├── ai/
│   │   ├── ai.service.ts             # Appels Claude API
│   │   ├── ai.module.ts
│   │   └── prompts/
│   │       └── analyze-email.prompt.ts
│   │
│   ├── gmail/
│   │   ├── gmail.service.ts          # Pull emails + send reply
│   │   └── gmail.module.ts
│   │
│   ├── slack/
│   │   ├── slack.service.ts          # Webhooks sortants
│   │   └── slack.module.ts
│   │
│   ├── sheets/
│   │   ├── sheets.service.ts         # Export Google Sheets
│   │   └── sheets.module.ts
│   │
│   └── auth/
│       ├── auth.module.ts
│       ├── auth.guard.ts
│       └── jwt.strategy.ts
│
├── prisma/
│   ├── schema.prisma
│   └── migrations/
│
├── common/
│   ├── filters/                      # Exception filters globaux
│   ├── interceptors/                 # Logging, transform response
│   └── decorators/
│
└── main.ts
```

---

## 4. Modèle de données

### Schema Prisma

```prisma
model Email {
  id            String      @id @default(uuid())
  gmailId       String      @unique
  fromName      String
  fromEmail     String
  subject       String
  bodyHtml      String
  receivedAt    DateTime
  status        EmailStatus @default(PENDING)
  priority      Priority
  category      Category
  aiSummary     String?
  aiReply       String?
  aiConfidence  Float?
  sentReply     String?
  exportedAt    DateTime?
  createdAt     DateTime    @default(now())
  updatedAt     DateTime    @updatedAt
  messages      Message[]
}

model Message {
  id        String   @id @default(uuid())
  emailId   String
  email     Email    @relation(fields: [emailId], references: [id])
  role      Role
  content   String
  sentAt    DateTime
}

enum EmailStatus { PENDING AWAITING_VALIDATION PROCESSED }
enum Priority    { HIGH MEDIUM LOW }
enum Category    { REFUND DELIVERY_ISSUE TECHNICAL BILLING OTHER }
enum Role        { CLIENT SUPPORT }
```

---

## 5. Spécifications fonctionnelles MVP

### 5.1 Dashboard Inbox

**User Story :** En tant qu'agent support, je veux voir tous les emails entrants dans une liste afin de suivre leur statut et leur priorité.

**Contenu de chaque ligne :**
- Nom du client
- Sujet
- Résumé IA court
- Catégorie IA (Chip coloré)
- Priorité IA (Chip coloré)
- Statut (Chip coloré)
- Date de réception

**Header :**
- Titre "Inbox"
- Compteur d'emails en attente
- Bouton refresh
- Badge "Gmail connected" + animation sync

**Statuts :**
- `PENDING` — reçu, pas encore analysé
- `AWAITING_VALIDATION` — analysé par l'IA, en attente de validation agent
- `PROCESSED` — réponse envoyée

**Priorités :** `HIGH` · `MEDIUM` · `LOW`

**Catégories :** `REFUND` · `DELIVERY_ISSUE` · `TECHNICAL` · `BILLING` · `OTHER`

---

### 5.2 Synchronisation Gmail

**User Story :** En tant qu'agent support, je veux que les emails soient automatiquement synchronisés depuis Gmail.

- Pull automatique via cron NestJS (intervalle configurable via `.env`)
- Badge "Gmail connected" dans la UI
- Animation lors de la synchronisation

---

### 5.3 Détail d'un email

**User Story :** En tant qu'agent support, je veux ouvrir un email pour consulter son contenu et les suggestions IA.

**Layout split-view (60/40) :**

| Colonne gauche | Colonne droite |
|---|---|
| Corps de l'email client | Résumé IA |
| Fil de conversation historique | Catégorie |
| | Priorité |
| | Score de confiance IA (0–100%) |
| | Réponse suggérée (éditable) |

---

### 5.4 Fil de conversation

**User Story :** En tant qu'agent support, je veux voir l'historique des échanges avec un client.

- Messages affichés chronologiquement
- Distinction visuelle claire : bulle CLIENT (gauche) vs bulle SUPPORT (droite)
- Style chat, lecture fluide

---

### 5.5 Synthèse IA

**User Story :** En tant qu'agent support, je veux un résumé automatique de la demande.

- 1 à 2 phrases maximum
- Affiché dès l'ouverture du détail
- Skeleton loading pendant la génération

---

### 5.6 Suggestion de réponse IA

**User Story :** En tant qu'agent support, je veux une réponse générée par IA pour accélérer le traitement.

**Actions disponibles :**
- ✏️ **Modifier** la réponse (TextField multiline)
- 🔄 **Régénérer** la réponse (appel Claude)
- ✅ **Valider et envoyer** (déclenche l'envoi Gmail)

---

### 5.7 Validation humaine & workflow de statut

**User Story :** En tant qu'agent support, je veux valider les réponses IA avant envoi.

Workflow :
```
PENDING → AWAITING_VALIDATION → PROCESSED
```

- Passage `PENDING → AWAITING_VALIDATION` : automatique après analyse IA
- Passage `AWAITING_VALIDATION → PROCESSED` : sur action humaine "Valider et envoyer"

---

### 5.8 Notifications Slack

**User Story :** En tant que manager, je veux être notifié sur Slack pour les emails critiques.

**Déclencheurs :** email classé `HIGH` priority

**Contenu de la notification :**
- Client (nom + email)
- Sujet
- Catégorie
- Résumé IA
- Lien direct vers l'email dans l'app

---

### 5.9 Export Google Sheets

**User Story :** En tant que manager, je veux que les données des emails traités soient exportées vers Google Sheets.

**Déclenchement :** automatique au passage en `PROCESSED`

**Colonnes exportées :**
- Date
- Client
- Sujet
- Catégorie IA
- Priorité
- Statut final
- Réponse envoyée

**UX :** Toast léger `"Exported to Google Sheets"` après export réussi.

---

## 6. Intégrations externes

### Gmail API

```
OAuth2 via NextAuth + scopes : gmail.readonly + gmail.send
Pull via cron NestJS (@nestjs/schedule)
Package : googleapis
```

### Slack

```
Webhook entrant uniquement (pas d'OAuth complet)
Config : SLACK_WEBHOOK_URL dans .env
Déclenchement : email HIGH priority créé
```

### Google Sheets

```
Service Account Google (pas OAuth user)
1 spreadsheet fixe, append de lignes via googleapis
Déclenchement : email passé en PROCESSED
```

---

## 7. Pipeline IA

### Séquence de traitement

```
Gmail Pull
    │
    ▼
GmailService.fetchNew()
    │  → crée Email en DB (PENDING)
    ▼
AIService.analyze(email)
    │  → appel Claude API unique
    │  → résumé + catégorie + priorité + réponse suggérée
    │  → update DB (AWAITING_VALIDATION)
    ▼
[Si HIGH priority] → SlackService.notify()
    │
    ▼
Agent valide/modifie dans l'UI
    │
    ▼
GmailService.sendReply()
    │  → status = PROCESSED
    ▼
SheetsService.export()
    │  → toast "Exported to Google Sheets"
```

### Prompt Claude (structure)

```
Tu es un assistant support client. Analyse cet email et retourne UNIQUEMENT un JSON valide :
{
  "summary": "...",           // 1-2 phrases, ton neutre
  "category": "REFUND|DELIVERY_ISSUE|TECHNICAL|BILLING|OTHER",
  "priority": "HIGH|MEDIUM|LOW",
  "confidence": 0.0-1.0,
  "suggestedReply": "..."     // réponse professionnelle complète, ton courtois
}

Email :
De : {{fromName}} <{{fromEmail}}>
Sujet : {{subject}}
---
{{body}}
```

**Coût estimé :** ~$0.002 par email avec `claude-sonnet`.
**Modèle à utiliser :** `claude-sonnet-4-20250514`

---

## 8. UI/UX — Design system

### Palette MUI

```typescript
// theme/muiTheme.ts
const theme = createTheme({
  palette: {
    primary:   { main: '#1A73E8' },   // Google Blue — pro, familier
    secondary: { main: '#00BFA5' },   // Teal — accent moderne
    background: {
      default: '#F8FAFC',             // Off-white, doux
      paper:   '#FFFFFF',
    },
  },
});
```

### Patterns UI clés

- **Sidebar** : mini drawer MUI fixe à gauche
- **EmailList** : liste custom avec Cards légères (ou DataGrid MUI)
- **Badges** : MUI `Chip` colorés pour statuts, priorités, catégories
- **Détail** : split-view 60/40
- **Éditeur réponse** : `TextField` multiline + boutons Regenerate / Validate
- **Toasts** : `Snackbar` MUI
- **Loading** : `Skeleton` MUI sur tous les blocs IA

### Règles UX

- Skeleton sur tous les appels IA — ne jamais laisser un bloc vide
- Bouton "Regenerate" visible uniquement quand une réponse IA existe
- Confirmation visuelle (toast) sur toutes les actions destructives ou irréversibles
- HIGH priority = mise en évidence rouge visible dans la liste

---

## 9. Plan de développement

### Sprints recommandés (solo)

| Sprint | Durée | Livrable |
|---|---|---|
| 1. Socle | 2 jours | Docker Compose, DB Prisma, Auth Google, routing Next.js, NestJS boilerplate |
| 2. Gmail | 1 jour | Pull emails, stockage DB, liste inbox |
| 3. IA | 1 jour | Intégration Claude API, analyse automatique, affichage résumé/catégorie/priorité |
| 4. Détail email | 1 jour | Vue détail, fil de conversation, éditeur réponse IA |
| 5. Validation & envoi | 1 jour | Workflow PENDING→PROCESSED, send reply Gmail |
| 6. Slack + Sheets | 1 jour | Notifications Slack + export Google Sheets |
| 7. UI Polish | 1–2 jours | Thème MUI, responsive, animations, skeleton, démo-ready |

**Total estimé : 8–10 jours de développement effectif.**

### Variables d'environnement requises

```bash
# .env (backend)
DATABASE_URL=postgresql://...
CLAUDE_API_KEY=sk-ant-...
GMAIL_CLIENT_ID=...
GMAIL_CLIENT_SECRET=...
GMAIL_REFRESH_TOKEN=...
SLACK_WEBHOOK_URL=https://hooks.slack.com/...
GOOGLE_SHEETS_SPREADSHEET_ID=...
GOOGLE_SERVICE_ACCOUNT_KEY=...   # JSON stringifié

# .env.local (frontend)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=...
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
NEXT_PUBLIC_API_URL=http://localhost:3001
```

---

## 10. Infrastructure & déploiement

```
Local dev  → Docker Compose (Postgres + NestJS + Next.js)
Frontend   → Vercel (free tier)
Backend    → Railway ou Render (free tier : 500h/mois)
DB prod    → Supabase (free : 500 MB Postgres)
IA         → Claude API pay-as-you-go (~$0 pour une démo)
```

### Docker Compose (dev)

```yaml
# docker-compose.yml
services:
  postgres:
    image: postgres:16
    environment:
      POSTGRES_DB: supportflow
      POSTGRES_USER: dev
      POSTGRES_PASSWORD: dev
    ports:
      - "5432:5432"

  backend:
    build: ./backend
    ports:
      - "3001:3001"
    depends_on:
      - postgres
    env_file: ./backend/.env

  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    env_file: ./frontend/.env.local
```

---

## 11. Règles de développement & bonnes pratiques

### 11.1 Principes généraux

- **KISS** — Keep It Simple, Stupid. Pas de sur-engineering pour une démo MVP.
- **YAGNI** — You Aren't Gonna Need It. Ne coder que ce qui est dans les specs.
- **DRY** — Don't Repeat Yourself. Extraire dès qu'un bloc est dupliqué 2x.
- **Single Responsibility** — chaque fichier, fonction, composant a une seule responsabilité.

---

### 11.2 Clean Code

#### Nommage

```typescript
// ✅ Noms explicites, intention claire
const fetchUnprocessedEmails = async () => { ... }
const isHighPriority = (email: Email): boolean => email.priority === 'HIGH'

// ❌ Abréviations opaques
const fetchEmls = async () => { ... }
const chk = (e: Email) => e.p === 'H'
```

#### Fonctions

- Maximum **20 lignes** par fonction — si plus, extraire
- Maximum **3 paramètres** — au-delà, utiliser un objet
- Pas d'effets de bord cachés
- Retourner tôt (`early return`) plutôt qu'imbriquer des `if`

```typescript
// ✅ Early return
const processEmail = async (email: Email) => {
  if (!email.aiSummary) return null
  if (email.status === 'PROCESSED') return email
  // ... traitement principal
}

// ❌ Imbriqué
const processEmail = async (email: Email) => {
  if (email.aiSummary) {
    if (email.status !== 'PROCESSED') {
      // ... traitement principal
    }
  }
}
```

#### Types TypeScript

- **Interdire `any`** — toujours typer explicitement
- Préférer `interface` pour les objets de données, `type` pour les unions/intersections
- Exporter les types depuis `types.ts` dans chaque feature

```typescript
// features/inbox/types.ts
export interface Email {
  id: string
  fromName: string
  fromEmail: string
  subject: string
  status: EmailStatus
  priority: Priority
  category: Category
  aiSummary: string | null
  receivedAt: Date
}

export type EmailStatus = 'PENDING' | 'AWAITING_VALIDATION' | 'PROCESSED'
export type Priority = 'HIGH' | 'MEDIUM' | 'LOW'
export type Category = 'REFUND' | 'DELIVERY_ISSUE' | 'TECHNICAL' | 'BILLING' | 'OTHER'
```

---

### 11.3 Architecture Feature-based (React Bulletproof)

Chaque feature est **autonome** : ses composants, hooks, services et types ne dépendent pas directement d'une autre feature.

```
features/
└── inbox/
    ├── components/   # UI pure, présentation uniquement
    ├── hooks/        # Logique métier et état local
    ├── services/     # Appels API — aucune logique métier
    └── types.ts      # Types propres à la feature
```

#### Règles strictes

```
✅ features/inbox peut importer depuis shared/
✅ features/inbox peut importer depuis features/inbox/
❌ features/inbox NE DOIT PAS importer depuis features/email-detail/
❌ shared/ NE DOIT PAS importer depuis features/
```

Si deux features ont besoin de communiquer → passer par le state global (Zustand/Context) ou remonter dans `shared/`.

#### Séparation des responsabilités dans les composants

```typescript
// ✅ Composant de présentation — reçoit des props, ne fetch pas
const EmailRow = ({ email, onSelect }: EmailRowProps) => (
  <Card onClick={() => onSelect(email.id)}>
    <Typography>{email.fromName}</Typography>
    <StatusBadge status={email.status} />
  </Card>
)

// ✅ Hook — contient la logique et le fetch
const useEmails = () => {
  const { data, isLoading, error } = useQuery(['emails'], fetchEmails)
  return { emails: data, isLoading, error }
}

// ✅ Page — compose le hook et le composant
const InboxPage = () => {
  const { emails, isLoading } = useEmails()
  const router = useRouter()
  if (isLoading) return <EmailListSkeleton />
  return <EmailList emails={emails} onSelect={(id) => router.push(`/inbox/${id}`)} />
}
```

---

### 11.4 Gestion des erreurs

- Toujours gérer les erreurs asynchrones avec `try/catch`
- Utiliser des `Error Boundaries` React pour les composants critiques
- Logger côté backend avec un niveau approprié (`warn`, `error`)
- Ne jamais exposer les stack traces au client en production

```typescript
// backend — service NestJS
async analyzeEmail(email: Email): Promise<AIAnalysis> {
  try {
    const response = await this.anthropic.messages.create({ ... })
    return this.parseAIResponse(response)
  } catch (error) {
    this.logger.error(`AI analysis failed for email ${email.id}`, error.stack)
    throw new InternalServerErrorException('AI analysis unavailable')
  }
}
```

---

### 11.5 Gestion de l'état frontend

- **React Query** (`@tanstack/react-query`) pour **tout** l'état serveur (fetch, cache, mutations) — **aucune exception**
- **Zustand** (optionnel) pour l'état UI global minimal (ex: sidebar ouverte, theme)
- Pas de Redux — trop lourd pour ce projet
- **Jamais** stocker en `useState` ce qui vient du serveur — laisser React Query gérer le cache

#### React Query — Règles obligatoires

**Query keys** : toujours structurées en tableau, du plus général au plus spécifique.

```typescript
// shared/lib/queryKeys.ts — centraliser TOUTES les query keys ici
export const queryKeys = {
  emails: {
    all: ['emails'] as const,
    lists: () => [...queryKeys.emails.all, 'list'] as const,
    list: (filters: EmailFilters) => [...queryKeys.emails.lists(), filters] as const,
    detail: (id: string) => [...queryKeys.emails.all, 'detail', id] as const,
  },
}
```

**Queries** : toujours dans un hook custom dédié, jamais directement dans un composant.

```typescript
// features/inbox/hooks/useEmails.ts
export const useEmails = (filters: EmailFilters) => {
  return useQuery({
    queryKey: queryKeys.emails.list(filters),
    queryFn: () => inboxService.getEmails(filters),
    staleTime: 30_000,         // 30s avant refetch automatique
    placeholderData: keepPreviousData,
  })
}
```

**Mutations** : toujours invalider le cache pertinent dans `onSuccess`.

```typescript
// features/email-detail/hooks/useValidateEmail.ts
export const useValidateEmail = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (emailId: string) => emailDetailService.validateAndSend(emailId),
    onSuccess: (_, emailId) => {
      // Invalider la liste ET le détail
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.lists() })
      queryClient.invalidateQueries({ queryKey: queryKeys.emails.detail(emailId) })
    },
    onError: (error) => {
      // Toujours gérer l'erreur — afficher un toast Snackbar
      console.error('Validation failed:', error)
    },
  })
}
```

**Règles React Query à respecter :**
- `staleTime` explicite sur toutes les queries (jamais laisser la valeur par défaut à 0)
- Toujours gérer les états `isLoading`, `isError` dans les composants
- Optimistic updates uniquement si l'UX l'exige vraiment (complexité accrue)
- Un seul `QueryClientProvider` à la racine de l'app

---

#### React Hook Form — Règles obligatoires

**Utiliser React Hook Form dès qu'il y a un formulaire**, même simple. Jamais de `useState` pour gérer les champs d'un formulaire.

**Toujours coupler avec `zod`** pour la validation du schéma.

```typescript
// features/email-detail/components/AIReplyEditor.tsx
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// 1. Définir le schéma Zod
const replySchema = z.object({
  replyContent: z.string().min(10, 'La réponse doit faire au moins 10 caractères'),
})

type ReplyFormValues = z.infer<typeof replySchema>

// 2. Utiliser dans le composant
export const AIReplyEditor = ({ emailId, initialReply }: AIReplyEditorProps) => {
  const { mutate: validateEmail, isPending } = useValidateEmail()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
    reset,
  } = useForm<ReplyFormValues>({
    resolver: zodResolver(replySchema),
    defaultValues: { replyContent: initialReply },
  })

  const onSubmit = (data: ReplyFormValues) => {
    validateEmail({ emailId, reply: data.replyContent })
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('replyContent')}
        multiline
        rows={6}
        error={!!errors.replyContent}
        helperText={errors.replyContent?.message}
        fullWidth
      />
      <Button type="submit" disabled={isPending || !isDirty}>
        {isPending ? 'Envoi...' : 'Valider et envoyer'}
      </Button>
    </form>
  )
}
```

**Règles React Hook Form à respecter :**
- Schéma Zod défini **en dehors** du composant (jamais inline)
- `type FormValues = z.infer<typeof schema>` — toujours inférer le type depuis Zod
- `defaultValues` toujours fourni pour éviter les inputs non contrôlés
- Ne jamais utiliser `watch()` en boucle serrée — préférer `getValues()` sur event
- `reset(newValues)` pour mettre à jour le formulaire depuis des données serveur (ex: après régénération IA)

---

### 11.6 Conventions de code

#### Fichiers et dossiers

```
PascalCase  → composants React      (EmailRow.tsx, AISummary.tsx)
camelCase   → hooks, services, utils (useEmails.ts, gmail.service.ts)
kebab-case  → dossiers              (email-detail/, shared/)
SCREAMING   → constantes globales   (MAX_RETRY_COUNT)
```

#### Structure d'un composant React

```typescript
// 1. Imports externes
import { useState } from 'react'
import { Card, Typography } from '@mui/material'

// 2. Imports internes
import { StatusBadge } from '@/features/inbox/components/StatusBadge'
import type { Email } from '@/features/inbox/types'

// 3. Types/interfaces locaux
interface EmailRowProps {
  email: Email
  onSelect: (id: string) => void
}

// 4. Composant
export const EmailRow = ({ email, onSelect }: EmailRowProps) => {
  // 4a. Hooks
  const [isHovered, setIsHovered] = useState(false)

  // 4b. Handlers
  const handleClick = () => onSelect(email.id)

  // 4c. JSX
  return (
    <Card onClick={handleClick}>
      <Typography>{email.fromName}</Typography>
    </Card>
  )
}
```

---

### 11.7 Tests

#### Stratégie de test

| Type | Outil | Cible | Coverage |
|---|---|---|---|
| Unit (backend) | Jest | Services NestJS, utils, transformers | ≥ 80% |
| Unit (frontend) | Vitest + Testing Library | Hooks custom, composants purs | ≥ 70% |
| Integration | Jest + Supertest | Endpoints NestJS (controller → DB) | Flux critiques |
| E2E | Playwright | Flux complets (inbox → validation → envoi) | Flux critiques |

#### Règle absolue — Tests après chaque développement

> **Après chaque feature ou modification de code, les tests DOIVENT passer avant de continuer.**

Séquence obligatoire à chaque fin de sprint ou de feature :

```bash
# Backend
cd backend && npm run test        # unit tests
cd backend && npm run test:e2e    # integration tests

# Frontend
cd frontend && npm run test       # vitest
cd frontend && npm run test:e2e   # playwright
```

Si un test échoue → **corriger avant de committer**. Ne jamais laisser des tests rouges en `develop`.

#### Nommage des tests

```typescript
// ✅ Intention claire, structure describe/it
describe('AIService', () => {
  describe('analyzeEmail', () => {
    it('should return HIGH priority when subject contains "urgent"', async () => { ... })
    it('should return REFUND category when body mentions "remboursement"', async () => { ... })
    it('should throw InternalServerErrorException when Claude API is unavailable', async () => { ... })
  })
})
```

#### Exemples de tests obligatoires

```typescript
// ✅ Test service NestJS avec mock Prisma
describe('EmailsService', () => {
  it('should update status to PROCESSED after sending reply', async () => {
    const mockEmail = createMockEmail({ status: 'AWAITING_VALIDATION' })
    prismaMock.email.update.mockResolvedValue({ ...mockEmail, status: 'PROCESSED' })

    const result = await emailsService.markAsProcessed(mockEmail.id)

    expect(result.status).toBe('PROCESSED')
    expect(prismaMock.email.update).toHaveBeenCalledWith({
      where: { id: mockEmail.id },
      data: { status: 'PROCESSED' },
    })
  })
})

// ✅ Test hook React Query avec mock API
describe('useEmails', () => {
  it('should return emails list on success', async () => {
    server.use(http.get('/api/emails', () => HttpResponse.json(mockEmails)))

    const { result } = renderHook(() => useEmails({}), { wrapper: QueryClientWrapper })
    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toHaveLength(mockEmails.length)
  })
})
```

---

#### Instructions spécifiques pour Claude Code

> Ces règles s'appliquent à Claude Code lorsqu'il génère ou modifie du code sur ce projet.

**Ne jamais inventer — toujours demander en cas de doute.**

Si Claude Code n'a pas l'information nécessaire pour implémenter correctement une feature (comportement attendu, structure de données, règle métier), il doit **poser la question explicitement** plutôt que de faire une supposition. Exemples de situations où demander :

- Le comportement exact d'un cas limite n'est pas spécifié dans les specs
- Deux approches d'implémentation sont valides et ont des tradeoffs différents
- Une dépendance externe ou une configuration manque dans les fichiers fournis
- Le schéma de données ne couvre pas un cas rencontré

Format attendu de la question :

```
❓ Question avant de continuer :
[Description du blocage ou du manque d'information]

Option A : [approche 1 + tradeoff]
Option B : [approche 2 + tradeoff]

Quelle option préférez-vous, ou avez-vous une autre contrainte à prendre en compte ?
```

**Lancer les tests après chaque modification.** Claude Code doit systématiquement exécuter la commande de test correspondante après avoir créé ou modifié un fichier, et reporter le résultat avant de passer à l'étape suivante.

---

### 11.8 Git & collaboration

#### Convention de commits (Conventional Commits)

```
feat(inbox): add AI summary skeleton loading
fix(gmail): handle expired OAuth token gracefully
refactor(ai): extract prompt builder to separate module
chore(deps): upgrade @anthropic-ai/sdk to 0.24.0
test(emails): add unit tests for priority classification
```

#### Branches

```
main          → production stable
develop       → intégration continue
feat/*        → nouvelles fonctionnalités
fix/*         → corrections de bugs
```

---

---

## 12. Sécurité

> Cette section est **non négociable**. Chaque point doit être implémenté avant mise en production, même pour une démo.

---

### 12.1 Gestion des secrets et variables d'environnement

**Règle absolue : zéro secret dans le code source.**

```bash
# ✅ Structure obligatoire
.env              # jamais committé — ajouté dans .gitignore
.env.example      # committé — toutes les clés avec valeurs vides
.gitignore        # doit contenir : .env, .env.local, .env.*.local
```

```bash
# .env.example
DATABASE_URL=
CLAUDE_API_KEY=
GMAIL_CLIENT_ID=
GMAIL_CLIENT_SECRET=
GMAIL_REFRESH_TOKEN=
SLACK_WEBHOOK_URL=
GOOGLE_SHEETS_SPREADSHEET_ID=
GOOGLE_SERVICE_ACCOUNT_KEY=
NEXTAUTH_SECRET=
JWT_SECRET=
JWT_EXPIRES_IN=3600
```

**Checklist secrets :**
- [ ] `.env` présent dans `.gitignore` avant le premier commit
- [ ] Aucune clé API ou mot de passe dans les fichiers de config (`nest-cli.json`, `next.config.js`, etc.)
- [ ] Aucune clé dans les logs applicatifs
- [ ] Rotation des clés si un secret est accidentellement exposé (push Git, log visible)

---

### 12.2 Authentification & gestion des sessions

#### JWT

```typescript
// backend — auth.module.ts
JwtModule.register({
  secret: process.env.JWT_SECRET,
  signOptions: {
    expiresIn: '1h',          // Access token court
    algorithm: 'HS256',
  },
})

// Refresh token : durée 7 jours, stocké en DB (hashé), révocable
```

**Règles JWT :**
- Access token : **1 heure max** — jamais de durée illimitée
- Refresh token : **7 jours**, stocké hashé en base (bcrypt), révocable sur déconnexion
- Ne jamais stocker le JWT en `localStorage` — utiliser un cookie `HttpOnly; Secure; SameSite=Strict`
- Valider la signature ET l'expiration côté backend sur chaque requête protégée

#### Cookies de session

```typescript
// backend — main.ts
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,       // inaccessible depuis JavaScript
    secure: true,         // HTTPS uniquement en production
    sameSite: 'strict',   // protection CSRF
    maxAge: 3600 * 1000,  // 1 heure
  },
}))
```

#### Google OAuth (NextAuth)

```typescript
// Scopes minimaux — ne demander que ce dont on a besoin
const GMAIL_SCOPES = [
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/gmail.send',
  // ❌ Pas de 'https://mail.google.com/' (accès total)
]
```

---

### 12.3 Autorisation — Guards NestJS

**Toutes les routes sont protégées par défaut.** Une route publique doit être explicitement décorée.

```typescript
// ✅ Guard JWT global appliqué à TOUTES les routes
// backend — app.module.ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },
]

// ✅ Routes publiques marquées explicitement
@Public()               // décorateur custom
@Get('health')
healthCheck() { ... }

// ✅ Guard par rôle si nécessaire
@Roles('ADMIN')
@Delete('/emails/:id')
deleteEmail() { ... }
```

```typescript
// backend — jwt-auth.guard.ts
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.get('isPublic', context.getHandler())
    if (isPublic) return true
    return super.canActivate(context)
  }
}
```

---

### 12.4 Validation et sanitisation des entrées

**Principe : ne jamais faire confiance à une donnée externe**, qu'elle vienne du client, d'un webhook Gmail, ou d'une réponse Claude.

#### Validation des DTOs (NestJS)

```typescript
// backend — main.ts — ValidationPipe global
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,          // supprime les champs non déclarés dans le DTO
  forbidNonWhitelisted: true, // rejette la requête si champ inconnu
  transform: true,          // cast automatique des types
  disableErrorMessages: false,
}))
```

```typescript
// ✅ DTO avec validation stricte
import { IsString, IsEmail, IsEnum, MaxLength, IsNotEmpty } from 'class-validator'
import { Transform } from 'class-transformer'

export class CreateEmailDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  @Transform(({ value }) => value.trim())   // supprimer les espaces inutiles
  fromName: string

  @IsEmail()
  @MaxLength(255)
  fromEmail: string

  @IsString()
  @MaxLength(500)
  subject: string

  @IsEnum(Category)
  category: Category
}
```

#### Sanitisation HTML (Frontend)

Les emails contiennent du HTML potentiellement malveillant. **Ne jamais utiliser `dangerouslySetInnerHTML` sans sanitisation.**

```typescript
// ✅ Toujours sanitiser avant affichage
import DOMPurify from 'dompurify'

const EmailBody = ({ htmlContent }: { htmlContent: string }) => {
  const sanitized = DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'ul', 'ol', 'li', 'a', 'blockquote'],
    ALLOWED_ATTR: ['href', 'target'],
    FORBID_SCRIPTS: true,
    FORBID_ATTR: ['style', 'onerror', 'onload', 'onclick'],
  })

  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />
}
```

#### Validation de la réponse Claude

```typescript
// backend — ai.service.ts
private parseAIResponse(raw: string): AIAnalysis {
  let parsed: unknown

  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error('Claude returned invalid JSON')
  }

  // Valider avec Zod — ne jamais faire confiance au JSON brut
  const result = aiAnalysisSchema.safeParse(parsed)
  if (!result.success) {
    this.logger.warn('Claude response failed schema validation', result.error)
    throw new Error('Claude response does not match expected schema')
  }

  return result.data
}

// Schéma de validation de la réponse IA
const aiAnalysisSchema = z.object({
  summary: z.string().max(500),
  category: z.enum(['REFUND', 'DELIVERY_ISSUE', 'TECHNICAL', 'BILLING', 'OTHER']),
  priority: z.enum(['HIGH', 'MEDIUM', 'LOW']),
  confidence: z.number().min(0).max(1),
  suggestedReply: z.string().max(5000),
})
```

---

### 12.5 Protection contre les attaques web courantes

#### Injection SQL

Prisma utilise des requêtes préparées par défaut — **ne jamais utiliser `$queryRawUnsafe`** avec des entrées utilisateur.

```typescript
// ✅ Requête Prisma — paramètre bind automatique
const emails = await prisma.email.findMany({
  where: { fromEmail: userInput },  // sécurisé
})

// ❌ Jamais
await prisma.$queryRawUnsafe(`SELECT * FROM emails WHERE from_email = '${userInput}'`)

// ✅ Si $queryRaw est nécessaire (rare), utiliser les paramètres bind
await prisma.$queryRaw`SELECT * FROM emails WHERE from_email = ${userInput}`
```

#### XSS (Cross-Site Scripting)

- Sanitiser tout HTML affiché (voir 12.4)
- Next.js échappe automatiquement les variables JSX — ne jamais contourner avec `dangerouslySetInnerHTML` sans DOMPurify
- Headers HTTP : `Content-Security-Policy` (voir 12.7)

#### CSRF (Cross-Site Request Forgery)

```typescript
// Protection CSRF via SameSite=Strict sur les cookies (voir 12.2)
// Pour les endpoints non-cookie (API REST avec JWT Bearer), le CSRF n'est pas applicable
// Vérifier l'origine des webhooks entrants (Gmail, Slack)

// ✅ Vérification signature webhook Slack
const verifySlackSignature = (req: Request): boolean => {
  const timestamp = req.headers['x-slack-request-timestamp']
  const signature = req.headers['x-slack-signature']
  const body = req.rawBody

  const baseString = `v0:${timestamp}:${body}`
  const hmac = crypto.createHmac('sha256', process.env.SLACK_SIGNING_SECRET)
  const computed = `v0=${hmac.update(baseString).digest('hex')}`

  return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(signature))
}
```

#### Brute force & Rate Limiting

```typescript
// backend — main.ts
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler'

ThrottlerModule.forRoot([{
  name: 'short',
  ttl: 1000,    // 1 seconde
  limit: 5,     // 5 requêtes max par seconde par IP
}, {
  name: 'long',
  ttl: 60_000,  // 1 minute
  limit: 100,   // 100 requêtes max par minute par IP
}])

// Appliquer globalement
providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }]

// Rate limit plus strict sur l'authentification
@Throttle({ short: { ttl: 60_000, limit: 5 } })  // 5 tentatives/minute
@Post('auth/login')
login() { ... }
```

#### SSRF (Server-Side Request Forgery)

Ne jamais effectuer de requêtes HTTP vers une URL fournie par l'utilisateur sans validation stricte.

```typescript
// ✅ Valider les URLs avant tout fetch côté backend
const ALLOWED_DOMAINS = ['gmail.googleapis.com', 'sheets.googleapis.com', 'hooks.slack.com']

const isSafeUrl = (url: string): boolean => {
  try {
    const parsed = new URL(url)
    return (
      ['https:'].includes(parsed.protocol) &&
      ALLOWED_DOMAINS.some(d => parsed.hostname.endsWith(d))
    )
  } catch {
    return false
  }
}
```

---

### 12.6 Protection des données utilisateur (RGPD / Privacy by Design)

#### Principe de minimisation

- Ne collecter et stocker **que** les données nécessaires au fonctionnement
- Champs stockés : `fromName`, `fromEmail`, `subject`, `bodyHtml` — pas de données bancaires, pas de localisation
- Supprimer les emails `PROCESSED` après 90 jours (configurable via cron)

```typescript
// backend — emails.service.ts — purge automatique
@Cron('0 2 * * *')  // chaque nuit à 2h
async purgeOldEmails(): Promise<void> {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - 90)

  await this.prisma.email.deleteMany({
    where: {
      status: 'PROCESSED',
      updatedAt: { lt: cutoff },
    },
  })

  this.logger.log('Old emails purged successfully')
}
```

#### Données en base

```typescript
// ✅ Ne jamais logger de données personnelles (email, nom, contenu)
this.logger.log(`Email processed: id=${email.id}`)       // ✅
this.logger.log(`Email from ${email.fromEmail} processed`) // ❌ PII dans les logs

// ✅ Masquer les emails dans les messages d'erreur renvoyés au client
throw new NotFoundException(`Email ${id} not found`)      // ✅
throw new NotFoundException(`Email from ${email.fromEmail} not found`) // ❌
```

#### Chiffrement des données sensibles

```typescript
// Le bodyHtml peut contenir des informations sensibles
// En production : chiffrement au repos via Supabase (activé par défaut)
// En local : le volume Docker n'est pas chiffré — ne pas stocker de vraies données de prod en local

// ✅ Pour les tokens OAuth stockés en DB (refresh tokens Google)
import * as bcrypt from 'bcrypt'

const hashedToken = await bcrypt.hash(refreshToken, 12)
// Stocker hashedToken, jamais le token brut
```

#### Accès aux données

- Un agent ne peut accéder **qu'aux emails de sa propre organisation** (scope multi-tenant futur)
- Les exports Google Sheets ne contiennent pas le corps complet de l'email — uniquement les métadonnées
- Journalisation des accès aux données sensibles (audit log)

---

### 12.7 Headers de sécurité HTTP

```typescript
// frontend — next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload', // HTTPS forcé 2 ans
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',           // protection clickjacking
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',              // protection MIME sniffing
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",    // 'unsafe-inline' requis par MUI — à durcir si possible
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "connect-src 'self' https://api.anthropic.com https://*.googleapis.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()', // désactiver les APIs non utilisées
  },
]

module.exports = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
}
```

```typescript
// backend — main.ts
import helmet from '@fastify/helmet'  // ou helmet pour Express

app.use(helmet())    // ajoute automatiquement les headers de sécurité NestJS/Express
```

---

### 12.8 Sécurité des dépendances

```bash
# Auditer les vulnérabilités à chaque sprint
npm audit                    # identifier les CVE
npm audit fix                # corriger automatiquement si possible

# Outil de surveillance continue (CI)
npx better-npm-audit audit --level moderate --production

# Vérifier les licences des packages
npx license-checker --onlyAllow 'MIT;ISC;Apache-2.0;BSD-2-Clause;BSD-3-Clause'
```

**Règles dépendances :**
- Mettre à jour les dépendances **au moins une fois par sprint**
- Ne jamais ignorer une vulnérabilité `high` ou `critical` sans justification documentée
- Éviter les packages non maintenus (dernière version > 1 an sans mise à jour)
- Préférer les packages avec provenance vérifiée (`npm install --audit`)

---

### 12.9 Sécurité des intégrations tierces

#### Gmail API

```typescript
// ✅ Valider le token avant chaque appel
const validateGmailToken = async (accessToken: string): Promise<boolean> => {
  const res = await fetch(`https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`)
  const info = await res.json()
  return info.audience === process.env.GMAIL_CLIENT_ID && !info.error
}

// ✅ Révoquer l'accès à la déconnexion
const revokeGmailAccess = async (token: string) => {
  await fetch(`https://oauth2.googleapis.com/revoke?token=${token}`, { method: 'POST' })
}
```

#### Slack Webhooks

```typescript
// ✅ Toujours vérifier la signature Slack (voir 12.5 CSRF)
// ✅ Ne jamais inclure de données sensibles dans la notification Slack
const buildSlackNotification = (email: Email) => ({
  blocks: [{
    type: 'section',
    text: {
      type: 'mrkdwn',
      // ✅ Résumé IA seulement — pas le corps complet de l'email
      text: `*Nouvel email prioritaire*\n*De :* ${email.fromName}\n*Sujet :* ${email.subject}\n*Résumé :* ${email.aiSummary}`,
    },
  }],
})
```

#### Google Sheets (Service Account)

```typescript
// ✅ Principe du moindre privilège — scope limité
const SHEETS_SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
// ❌ Pas de 'https://www.googleapis.com/auth/drive' (accès Drive complet)

// ✅ Stocker la Service Account key dans une variable d'env, pas dans un fichier committé
const serviceAccountKey = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY)
```

---

### 12.10 Checklist sécurité avant mise en production

```
Secrets & Config
[ ] Aucun secret dans le code source ou les fichiers de config
[ ] .env en .gitignore, .env.example à jour
[ ] Toutes les clés régénérées pour la production (pas les clés de dev)
[ ] Variables d'environnement injectées via le panel Vercel/Railway (pas de fichier)

Authentification
[ ] JWT expiration 1h, cookie HttpOnly Secure SameSite=Strict
[ ] Refresh token hashé en base, révocable
[ ] Rate limiting sur /auth/login (max 5/min)
[ ] Google OAuth scopes au minimum requis

Backend
[ ] ValidationPipe global avec whitelist:true
[ ] JwtAuthGuard global, routes publiques explicitement décorées
[ ] Helmet activé
[ ] Throttling global configuré
[ ] Aucun $queryRawUnsafe avec entrées utilisateur
[ ] Logs sans PII (emails, noms, contenus)

Frontend
[ ] DOMPurify sur tout le HTML des emails
[ ] Aucun JWT en localStorage
[ ] Headers CSP configurés dans next.config.js
[ ] Aucune clé API dans le bundle client (NEXT_PUBLIC_*)

Données
[ ] Cron de purge des emails > 90 jours configuré
[ ] Refresh tokens Google hashés
[ ] Export Sheets : métadonnées uniquement, pas le body complet

Dépendances
[ ] npm audit sans vulnérabilité high/critical
[ ] Dépendances à jour
```

---

### 11.9 Performance

- Pagination côté backend pour la liste inbox (défaut : 20 emails par page)
- Debounce sur les champs de recherche/filtre (300ms)
- `next/dynamic` pour les composants lourds (éditeur de réponse)
- Skeleton systématique sur tous les appels IA
- Mémoïsation avec `useMemo`/`useCallback` uniquement si profiling le justifie — pas de micro-optimisation prématurée

---

*Dernière mise à jour : mai 2026*