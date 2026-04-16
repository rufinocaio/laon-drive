# Laon Drive - Implementação Técnica 💻

Este projeto é uma aplicação de gerenciamento de arquivos (estilo cloud storage) desenvolvida com o objetivo de demonstrar competência técnica na integração de stacks modernas, arquitetura de software e manipulação de armazenamento externo.

Foi implantada a API do Uploadthing para servir como base de dados para os arquivos, e também é possível que cada usuário cadastre novos buckets compatíveis com S3 na configuração do usuário, assim podendo administrar diversos buckets de arquivos.

---

## 🏗️ Base de Desenvolvimento

A aplicação foi construída utilizando o **Laravel + React Starter Kit** oficial como fundação, sendo estendida para suportar funcionalidades complexas de sistema de arquivos e multi-tenancy de armazenamento.

---

## 🛠️ Padrões e Decisões de Arquitetura

Para garantir a escalabilidade e manutenibilidade do projeto, foram aplicados os seguintes padrões:

### 1. Service Layer Pattern
A lógica de manipulação de buckets e integração com o S3 foi abstraída na camada de **Service** (`StorageManagerService`). Isso desacopla os Controllers da implementação específica do Flysystem, permitindo a troca ou expansão de provedores de storage sem afetar a lógica de negócio.

### 2. Recursive Self-Referencing Model
A estrutura de pastas e arquivos é gerenciada por um único modelo `File` que utiliza um relacionamento recursivo (`parent_id`).
-   Permite navegação em profundidade infinita.
-   Utiliza **ULIDs** (Universally Unique Lexicographically Sortable Identifier) em vez de IDs incrementais para maior segurança e compatibilidade com sistemas distribuídos.

### 3. Security & Data Protection
-   **Criptografia de Credenciais:** As chaves de acesso e segredos dos buckets S3 configurados pelos usuários são armazenados no banco de dados utilizando o cast `encrypted` do Eloquent, garantindo que dados sensíveis nunca fiquem em texto claro no storage.
-   **Public Sharing via Tokens:** O compartilhamento de arquivos é feito através de tokens únicos indexados, evitando a exposição direta de IDs de banco de dados na URL.

### 4. Interface Reativa com Inertia.js
O projeto utiliza o **Inertia.js** para conectar o backend Laravel ao frontend React 19, mantendo a robustez de um sistema de rotas e autenticação server-side com a fluidez de uma aplicação Single Page (SPA).

---

## 🧰 Stack Tecnológica

-   **Backend:** Laravel 13 (PHP 8.3+)
-   **Frontend:** React 19 + TypeScript
-   **Estilização:** Tailwind CSS 4
-   **Auth:** Laravel Fortify (simplificado para o propósito do teste)
-   **Core:** Inertia.js, Radix UI, Flysystem S3 SDK.

---

## 🚀 Como Executar o Projeto

1.  **Dependências:**
    ```bash
    composer install
    npm install
    ```

2.  **Ambiente:**
    ```bash
    cp .env.example .env
    php artisan key:generate
    ```
    É necessário adicionar a variável de ambiente 'UPLOADTHING_TOKEN' do Uploadthing para utilizar o 'Bucket Principal' 

3.  **Banco de Dados:**
    ```bash
    php artisan migrate
    ```

4.  **Desenvolvimento:**
    ```bash
    composer dev
    ```

---

## 📂 Estrutura de Pastas Relevante

-   `app/Services/StorageManagerService.php`: Coração da lógica de abstração de buckets.
-   `app/Models/File.php`: Implementação da lógica de hierarquia e ULIDs.
-   `resources/js/components/drive`: Componentes React estruturais do sistema de arquivos.
-   `database/migrations`: Definição de esquema para suporte a múltiplos buckets e compartilhamento.
