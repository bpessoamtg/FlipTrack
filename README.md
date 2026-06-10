# FlipTrack

Aplicação web para registo de compra e revenda de produtos online (OLX, Vinted, Facebook, eBay, etc.).

## Stack

- **React + Vite + TypeScript** — frontend
- **Tailwind CSS v4** — estilos
- **Recharts** — gráficos
- **Supabase** — base de dados PostgreSQL + Realtime
- **Zustand** — estado global
- **PWA** — instalável em mobile/desktop via `vite-plugin-pwa`

## Configuração Supabase

1. Crie um projecto em [supabase.com](https://supabase.com)
2. Execute o ficheiro `supabase-schema.sql` no **Editor SQL** do dashboard
3. Copie o **Project URL** e a **anon key** de *Settings → API*
4. Edite o ficheiro `.env` na raiz do projecto:

```env
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## Instalação e Execução

```bash
cd fliptrack
npm install
npm run dev
```

A aplicação abre em `http://localhost:5173`

## Build de Produção

```bash
npm run build
npm run preview
```

## Importação de Dados

1. Aceda a **Definições → Importar Dados**
2. Arraste um ficheiro CSV ou Excel (.xlsx)
3. Mapeie as colunas do ficheiro para os campos da app
4. Valide e confirme a importação

### Formato esperado no CSV/Excel

| Campo | Exemplo |
|-------|---------|
| Nome | LEGO City 60314 |
| Categoria | baby / board-game / other |
| Condição | new / used-like-new / used-good / used-fair |
| Preço Compra | 12.50 |
| Preço Venda | 18.00 |
| Data Compra | 2024-01-15 ou 15/01/2024 |
| Data Venda | 2024-02-03 |
| Plataforma | OLX |
| Estado | in-stock / sold / returned |

## Funcionalidades

- **Dashboard** — resumo financeiro + gráficos
- **Inventário** — artigos em stock com filtros e ordenação
- **Vendas** — histórico com lucro/prejuízo por artigo
- **Análises** — gráficos de desempenho por categoria, plataforma e mês
- **Definições** — modo escuro, exportar JSON/CSV, importar dados
- **PWA** — funciona offline, instalável em mobile
- **Realtime** — sincronização automática entre dispositivos
