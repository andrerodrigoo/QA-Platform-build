✓ Plataforma de Gestão de Testes de Garantia de Qualidade
Uma aplicação web completa para equipes de QA gerenciarem projetos, casos de teste, execuções de testes e bugs , com um painel de métricas de QA em tempo real . Desenvolvida como um projeto de portfólio que demonstra um fluxo de trabalho profissional de desenvolvimento de software orientado a QA — desde a engenharia de requisitos até testes automatizados, testes exploratórios, busca de bugs, prevenção de regressões e CI/CD.

Este projeto se concentra tanto em como foi construído (o processo de controle de qualidade) quanto em sua funcionalidade. Consulte docs/qa/a documentação completa de controle de qualidade.

✨ Recursos
Projetos — crie, edite, exclua; organize tudo por projeto.
Casos de teste — CRUD completo com prioridade, tipo, status, etapas e resultado esperado.
Pesquisa e filtro — encontre casos de teste por palavra-chave, status, prioridade e tipo.
Execução de testes — registre os resultados de Aprovado/Reprovado/Bloqueado com anotações e histórico.
Gerenciamento de bugs — reporte bugs (manualmente ou a partir de um teste com falha), acompanhe a gravidade, a prioridade e o ciclo de vida do status.
Painel de Controle de Qualidade — taxas de aprovação/reprovação/bloqueio, bugs por gravidade, contagem de bugs em aberto, resumos por projeto
🧱 Conjunto de tecnologias
Camada	Tecnologia
Front-end	React 18, TypeScript (estrito), Vite, React Router
Backend	Node.js, Express, TypeScript (estrito)
Validação	Zod (lado do servidor, enums compartilhados)
Banco de dados	Neon (Postgres sem servidor) via Drizzle ORM +@neondatabase/serverless
Dados locais/de teste	Repositório em memória (sem necessidade de banco de dados)
Testes de unidade/integração	Vitest + Supertest
Testes E2E	Dramaturgo
Lint / Format	ESLint (configuração plana) + Prettier
CI/CD	Ações do GitHub
Implantar	Netlify (frontend estático + Funções Netlify)
Arquitetura em resumo
Browser ──> React SPA (Vite build, static)
                │  fetch /api/*
                ▼
        Netlify redirect  ──>  Netlify Function (Express via serverless-http)
                                     │
                                     ▼
                         Repository interface
                          ├── MemoryRepository   (local dev / tests / CI)
                          └── NeonRepository      (production, Drizzle + Neon)
O padrão Repository é a principal decisão de design: a lógica de negócios depende de uma interface, portanto, todo o domínio é testável unitariamente com um armazenamento em memória, enquanto a produção roda no Neon. O mesmo aplicativo Express roda localmente e dentro da Função Netlify, de modo que os testes exercitam os caminhos de código de produção.

🚀 Primeiros passos
Pré-requisitos
Node.js 20+ (ver .nvmrc)
npm 10+
Instalar e executar (local, sem necessidade de banco de dados)
git clone https://github.com/<your-username>/qa-test-management-platform.git
cd qa-test-management-platform
npm install

# Start API (:3001) and frontend (:5173) together.
npm run dev
Abra http://localhost:5173 . Por padrão DATA_DRIVER=memory, nenhum banco de dados é necessário para o desenvolvimento local.

Usando Neon (Postgres)
Crie um banco de dados gratuito em neon.tech e copie a string de conexão.
Copiar .env.examplee .envdefinir:
DATABASE_URL=postgresql://...   # from Neon
DATA_DRIVER=neon
Aplique o esquema:
npm run db:generate   # generate migration from the Drizzle schema
npm run db:migrate    # apply it to Neon
npm run devagora persiste no Neon.
🧪 Testando
npm test              # unit + integration
npm run test:unit     # unit tests (Vitest)
npm run test:api      # integration / API tests (Vitest + Supertest)
npm run test:coverage # coverage report (>= 70% gate on business logic)
npm run test:e2e      # end-to-end tests (Playwright)
Pirâmide de testes: ~70% unidades · ~20% integração · ~10% E2E — veja docs/qa/test-strategy.md.

✅ Portão de Qualidade
Uma alteração só é considerada "concluída" quando todos esses critérios forem aprovados (imposto no CI):

npm run quality-gate   # lint + type-check + tests + build
Portão	Comando
Lint (0 erros)	npm run lint
Tipos (estritos, 0 erros)	npm run type-check
Testes unitários	npm run test:unit
Testes de integração	npm run test:api
Testes E2E	npm run test:e2e
Versão de produção	npm run build
☁️ Implante no Netlify
Envie este repositório para o GitHub.
No Netlify, adicione um novo site → Importe do GitHub e selecione o repositório.
O Netlify lê netlify.tomlautomaticamente:
Construir:npm run build
Diretório de publicação:packages/frontend/dist
Diretório de funções:netlify/functions
Em Configurações do site → Variáveis ​​de ambiente , defina:
DATABASE_URL= sua string de conexão Neon
DATA_DRIVER=neon
Implantação. O frontend faz chamadas /api/*, que o Netlify encaminha para a função Express.
📚 Documentação de controle de qualidade
Este projeto inclui um conjunto completo de documentação de controle de qualidade em docs/qa/:

Documento	Propósito
requirements.md	Visão, personas, histórias de usuário, requisitos funcionais/não funcionais, regras de negócio, critérios de aceitação, riscos
test-strategy.md	Níveis de teste, tipos, estratégia de automação, critérios de entrada/saída, estratégia de regressão e de teste de fumaça.
test-plan.md	Cronograma, recursos, abordagem, entregáveis, controle de qualidade
test-cases.md	Mais de 50 casos testados: positivo, negativo, BVA, EP, fumaça
bug-report-template.md	Formato profissional de relatório de erros
exploratory-testing.md	Cartas e conclusões dos testes exploratórios baseados em sessões
bug-reports.md	Erros reais encontrados, documentados e corrigidos.
learning-log.md	Registro contínuo de conceitos, decisões e lições aprendidas em Garantia da Qualidade.
🗂 Estrutura do Projeto
qa-platform/
├── packages/
│   ├── backend/         # Express API, services, repositories, Drizzle schema
│   └── frontend/        # React + Vite SPA
├── netlify/functions/   # Serverless entry (wraps the Express app)
├── e2e/                 # Playwright tests + Page Objects
├── docs/qa/             # QA documentation
├── .github/workflows/   # CI pipeline
└── .kiro/               # Steering rules & hooks (AI-assisted dev config)
📄 Licença
MIT — veja LICENÇA .

Construído com um fluxo de trabalho assistido por IA e com foco em controle de qualidade. O processo é documentado de ponta a ponta em docs/qa/learning-log.md.
