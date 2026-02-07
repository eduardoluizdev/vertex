# Plano: Empresa selecionada na sidebar (contexto tipo “perfil”)

## Objetivo

Permitir escolher **uma empresa** na sidebar e ter a navegação e as ações sempre no contexto dessa empresa — como se fosse “trocar de perfil”. Hoje já existe criação/edição de empresas; a mudança é tornar a empresa “ativa” visível e central na navegação.

## Comportamento desejado (resumo)

1. **Seletor de empresa na sidebar**  
   - Lista as empresas do usuário.  
   - Ao selecionar uma, ela vira a “empresa atual” e a navegação passa a ser em cima dela.

2. **Navegação contextual**  
   - Com empresa selecionada: atalhos diretos para **Clientes** e **Serviços** dessa empresa (sem precisar passar pela lista de empresas).  
   - Link para **Empresas** continua existindo (trocar de empresa ou criar nova).

3. **Persistência**  
   - A empresa selecionada deve ser lembrada (ex.: ao reabrir o app ou recarregar a página).

---

## Decisões de desenho

### 1. Onde guardar a “empresa atual”

| Opção | Prós | Contras |
|-------|------|--------|
| **Cookie** | Acessível no server (layout, redirects), sobrevive a reload | Precisa de Server Action ou route handler para setar a partir do client |
| **localStorage + React Context** | Fácil no client, sidebar já é client | Server não vê; ao recarregar em uma rota que não tem `[id]` na URL, pode “perder” contexto até o client hidratar |
| **Só URL** | Sem estado extra; “empresa atual” = rota em que estou | Menos sensação de “perfil” fixo; ao abrir `/` ou `/empresas` não há empresa óbvia |

**Recomendação:** **Cookie** para a empresa selecionada.

- Nome sugerido: `vertex_selected_company_id`.
- Assim o server pode, se quiser, redirecionar para a empresa salva ao abrir o dashboard (ex.: `/` → `/empresas/{id}/clientes`).
- A sidebar (client) lê o cookie e atualiza ao trocar de empresa (via Server Action que seta o cookie).

### 2. Comportamento da sidebar

- **Seção “Empresa” no topo da nav (abaixo do logo):**
  - Dropdown (ou combobox) com:
    - Lista de empresas (GET `/v1/companies`).
    - Opção “Ver todas as empresas” (link para `/empresas`).
    - Opção “Nova empresa” (link para `/empresas/nova`).
  - Ao selecionar uma empresa da lista: gravar no cookie + redirecionar para `/empresas/{id}/clientes` (ou manter na mesma “página lógica” trocando só o `id` na URL).

- **Itens de navegação:**
  - **Home** → `/` (resumo geral).
  - **Clientes** → só visível quando há empresa selecionada; link para `/empresas/{selectedId}/clientes`.
  - **Serviços** → só visível quando há empresa selecionada; link para `/empresas/{selectedId}/servicos`.
  - **Empresas** → sempre visível; link para `/empresas` (lista de empresas).

Assim, com uma empresa selecionada, o fluxo fica: “estou na empresa X” e os atalhos Clientes/Serviços já apontam para essa empresa.

### 3. Primeira visita / sem empresa no cookie

- Se não houver cookie (ou empresa inválida):
  - O seletor mostra algo como “Selecione uma empresa”.
  - Clientes e Serviços podem ficar ocultos ou desabilitados até haver seleção.
  - Ao escolher uma empresa, seta o cookie e redireciona para a área dessa empresa.

### 4. Redirecionamento ao entrar no dashboard (opcional)

- Ao acessar `/` (home do dashboard):
  - Se existir `vertex_selected_company_id` válido, pode redirecionar automaticamente para `/empresas/{id}/clientes` (ou para `/empresas/{id}` que hoje já redireciona para clientes).
- Alternativa mais conservadora: não redirecionar; apenas mostrar a home e deixar a sidebar com a empresa já “marcada” quando houver cookie.

---

## Implementação sugerida (passo a passo)

### Fase 1 – Cookie + leitura no server

1. **Cookie da empresa selecionada**
   - Nome: `vertex_selected_company_id`.
   - Path: `/`.
   - HttpOnly: opcional (se só o client precisar ler, pode ser `false` para o Next ler no server sem JS).

2. **Server: ler cookie no layout do dashboard**
   - No `(dashboard)/layout.tsx` (ou em um layout que envolva a sidebar), ler `vertex_selected_company_id`.
   - Passar para o `AppSidebar` (ex.: `selectedCompanyId: string | null`) para evitar flash “nenhuma empresa” antes do client hidratar (opcional; pode ser só no client se preferir).

3. **Server Action: definir empresa selecionada**
   - Criar em `apps/web/src/app/(dashboard)/_actions/` (ou em `lib/`) uma action `setSelectedCompany(companyId: string | null)`.
   - Na action: validar que o usuário tem acesso à empresa (ex.: listar empresas e checar se o id está na lista) e então setar o cookie `vertex_selected_company_id` e redirecionar para `/empresas/{id}/clientes` (ou manter path atual trocando o id).

### Fase 2 – Sidebar com seletor e itens condicionais

4. **Componente de seletor de empresa**
   - Client component que:
     - Recebe lista de empresas (pode ser passada pelo layout como prop ou buscada no client com `fetch`/`apiClient` via route handler ou server component que passa dados).
     - Mostra dropdown: nome da empresa atual (ou “Selecione uma empresa”) e lista de empresas.
     - Ao escolher item: chamar `setSelectedCompany(id)` (Server Action).
   - Se a lista for grande, considerar busca/combobox; senão, um `Select` ou `DropdownMenu` com as empresas basta.

5. **Alterar `AppSidebar`**
   - Incluir o seletor de empresa no topo da navegação (abaixo do logo).
   - Incluir itens **Clientes** e **Serviços** que:
     - Só aparecem quando `selectedCompanyId` está definido.
     - Apontam para `/empresas/{selectedCompanyId}/clientes` e `/empresas/{selectedCompanyId}/servicos`.
   - Manter **Empresas** como link para `/empresas`.
   - Garantir que, na página de lista de empresas (`/empresas`), o seletor ainda mostre a empresa atualmente selecionada (se houver), para consistência.

### Fase 3 – Dados e UX

6. **Origem da lista de empresas**
   - **Opção A:** Layout do dashboard (server) chama `apiClient('/v1/companies')`, passa empresas para o layout e depois para a sidebar (evita loading no client).
   - **Opção B:** Sidebar (client) chama um route handler (ex. `GET /api/companies`) que usa `apiClient` e retorna JSON (mantém API centralizada no server).
   - Recomendação: **Opção A** para evitar flash e uma requisição extra no client.

7. **Breadcrumb / título**
   - Nas páginas dentro de `empresas/[id]/...`, você já tem o nome da empresa no layout (`company-tabs`, etc.). Pode opcionalmente exibir no topo da sidebar o nome da empresa selecionada (no próprio seletor), para reforçar o “perfil”.

8. **Quando a empresa é deletada**
   - Se a empresa atual for excluída, ao setar o cookie ou ao carregar a página, validar se o id ainda existe na lista; se não, limpar o cookie e mostrar “Selecione uma empresa” de novo (e opcionalmente toast “Empresa removida”).

### Fase 4 – Ajustes finos (opcional)

9. **Redirecionamento em `/`**
   - Se quiser “entrar direto na empresa”: no `(dashboard)/page.tsx`, se houver cookie válido, `redirect(`/empresas/${id}/clientes`)`. Caso contrário, manter a home como está.

10. **URL como fonte da verdade ao navegar**
    - Ao navegar por link direto para `/empresas/outro-id/clientes`, considerar atualizar o cookie para `outro-id` (assim a sidebar reflete a empresa da URL). Isso pode ser feito no layout de `empresas/[id]` (server) setando o cookie, ou no client ao detectar mudança de `pathname`.

---

## Estrutura de arquivos sugerida

```
apps/web/src/
├── app/(dashboard)/
│   ├── layout.tsx                    # Busca empresas, lê cookie, passa para sidebar
│   ├── _actions/
│   │   └── set-selected-company.ts   # Server Action: setar cookie e redirect
│   └── ...
├── components/
│   ├── app-sidebar.tsx               # Inclui CompanySelector + itens Clientes/Serviços condicionais
│   └── company-selector.tsx          # Dropdown de empresas (client)
└── lib/
    └── cookies.ts                    # Helpers: getSelectedCompanyId(), setSelectedCompanyId() (usado na action)
```

- **Cookie:** ler em `layout.tsx` (e opcionalmente em `cookies.ts`); escrever apenas na Server Action (por segurança e para poder fazer `redirect`).

---

## Resumo de tarefas

| # | Tarefa | Prioridade |
|---|--------|------------|
| 1 | Cookie `vertex_selected_company_id` + helper de leitura no server | Alta |
| 2 | Server Action `setSelectedCompany(companyId)` (validar acesso, setar cookie, redirect) | Alta |
| 3 | Layout do dashboard buscar empresas e ler cookie; passar para sidebar | Alta |
| 4 | Componente `CompanySelector` (dropdown com empresas + “Ver todas” / “Nova”) | Alta |
| 5 | Sidebar: integrar seletor; mostrar Clientes/Serviços apenas com empresa selecionada | Alta |
| 6 | Tratar empresa deletada (limpar cookie se id inválido) | Média |
| 7 | Redirecionar `/` para empresa selecionada (opcional) | Baixa |
| 8 | Sincronizar cookie quando usuário navega por URL direta para outra empresa (opcional) | Baixa |

---

## Observações

- **Autenticação:** A API já usa `session.accessToken`; o `GET /v1/companies` retorna só as empresas do usuário. A validação na Server Action pode ser “id está na lista retornada por GET /v1/companies”.
- **Rotas atuais:** Nada precisa mudar em `empresas/[id]/clientes` e `empresas/[id]/servicos`; a mudança é só na sidebar e no “estado” da empresa selecionada (cookie + itens de menu).
- **Mobile:** O seletor pode ser o mesmo dropdown; em telas pequenas a sidebar já pode estar colapsada (só ícones), e o seletor pode mostrar só ícone da empresa ou abre em sheet/modal.

Se quiser, na próxima etapa podemos detalhar apenas a Fase 1 (cookie + action) ou ir direto para a implementação do `CompanySelector` e das mudanças na `AppSidebar`.
