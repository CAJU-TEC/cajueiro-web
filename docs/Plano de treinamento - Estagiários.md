# Plano de treinamento — Estagiários (Cajutec) 🚀

Guia objetivo para o treinamento de estagiários da equipe de desenvolvimento da Cajutec. O documento explica objetivos, habilidades esperadas, formato de avaliação e um esqueleto de roadmap.

---

## 📌 Objetivo

Os estagiários devem receber instruções e apoio da equipe de desenvolvimento. Haverá avaliações ao final de cada curso do roadmap para verificar a aquisição de cada habilidade.

No final, será aplicada uma avaliação prática composta por uma série de protocolos que o estagiário deverá resolver, cobrindo todas as habilidades aprendidas.

---

## 📝 Avaliações

* ✅ **Avaliação por módulo** — testes rápidos ao final de cada curso do roadmap para validar cada habilidade.
* ✅ **Avaliação final (prática)** — conjunto de protocolos que exercitem todas as habilidades aprendidas; o estagiário deverá resolver uma quantidade definida de protocolos.

---

## 💡 Habilidades esperadas (final do treinamento)

### 🐧 Linux (Comandos básicos)

* Navegar entre diretórios.
* Editar arquivos de texto.
* Criar e utilizar atalhos.

Exemplos úteis:

```bash
# mover-se entre pastas
cd /caminho/para/projeto
ls -la

# editar (nano)
nano README.md

# criar atalho (alias)
alias ll='ls -la'
```

---

### 🧠 Lógica de programação

* Tipos primitivos
* Condição (if / switch)
* Loops (for, while)
* Funções e métodos

---

### 🔧 Git / GitHub

* Branches
* Commits
* Conflitos
* Pull Requests

Comandos básicos:

```bash
# criar branch
git checkout -b feat/minha-funcao

# commit e push
git add .
git commit -m "feat: adicionar X"
git push origin feat/minha-funcao
```

---

### 🛠️ CRUD (Laravel)

* Básico de PHP: funções, classes, manipulação de arrays.
* Modelo MVC
* Modelo cliente-servidor
* Protocolo HTTP: GET, POST, PATCH

Exemplos rápidos:

```php
// rota básica (routes/web.php)
Route::resource('alunos', AlunoController::class);

// migration exemplo
php artisan make:migration create_alunos_table --create=alunos
```

---

### 🗄️ Banco de Dados

* Criar, exportar e importar bancos
* Tipos de dados (varchar, int, boolean, ...)
* Construção de queries: SELECT simples, SELECT com JOINs

SQL exemplo:

```sql
-- select com join
SELECT a.nome, t.nome AS turma
FROM alunos a
JOIN matriculas m ON m.aluno_id = a.id
JOIN turmas t ON t.id = m.turma_id;
```

---

### 🌐 Vue (Frontend)

* HTML: `<table>`, `<tr>`, `<td>`, `<div>`, `<template>`, `<v-select>`, `<v-btn>`
* CSS: Flexbox, layout
* JavaScript: funções, eventos, manipulação de objetos/arrays
* Componentização: uso de componentes Vue/Vuetify, fundamentos de reatividade, renderização condicional

Exemplo simples de componente:

```vue
<template>
  <div>
    <v-btn @click="contar">Clique ({{ contador }})</v-btn>
  </div>
</template>

<script>
export default {
  data: () => ({ contador: 0 }),
  methods: { contar() { this.contador++; } }
}
</script>
```

---

## 🛣️ Roadmap

> Em construção ...

---

## ✍️ Resumo

Os estagiários devem ser apresentados a este documento para saber o que precisam para se tornarem desenvolvedores da equipe.

---

## 🏃 Finalizando

* O que preciso saber? Habilidades esperadas.
* Como vou aprender? Roadmap e apoio da equipe.
* O que vai validar meu conhecimento? Avaliações de módulos e Avaliação Final.

---
