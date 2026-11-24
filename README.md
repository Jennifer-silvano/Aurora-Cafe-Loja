# ☕ Aurora Café – Loja virtual

Mini loja virtual de cafés especiais e acessórios, feita com **HTML, CSS e JavaScript puro** (sem frameworks ou bibliotecas). Projeto de portfólio criado para praticar o desenvolvimento de interfaces de e-commerce: catálogo, busca, filtros e carrinho de compras.

🔗 **Demo:** https://jennifer-silvano.github.io/Aurora-Cafe-Loja/

> Os produtos e a loja são fictícios.

## ✨ Funcionalidades

- **Catálogo de produtos** gerado a partir de uma lista de dados em JavaScript
- **Busca em tempo real** por nome ou descrição
- **Filtro por categoria** (Cafés, Acessórios e Kits)
- **Ordenação** por relevância, preço e nome
- **Carrinho de compras** em gaveta lateral, com:
  - aumentar, diminuir e remover itens
  - barra de progresso para o **frete grátis** (acima de R$ 150)
  - **cupom de desconto** (teste com `AURORA10`)
  - cálculo de subtotal, desconto, frete e total
  - **persistência com `localStorage`**: o carrinho continua após recarregar a página
- **Formulário de newsletter** com validação de e-mail
- **Avisos (toast)** ao adicionar produtos e finalizar o pedido

## 📱 Responsividade e acessibilidade

- Layout **mobile first** com CSS Grid e Flexbox (a grade se adapta de 1 coluna no celular a 4 no desktop)
- **Tema claro e escuro** automático, via `prefers-color-scheme`
- HTML semântico (`header`, `main`, `section`, `article`, `footer`)
- Navegação por teclado: foco visível, link "pular para o conteúdo", fechar o carrinho com `Esc` e devolução do foco
- Atributos ARIA (`aria-label`, `aria-live`, `aria-pressed`) para leitores de tela
- Respeita `prefers-reduced-motion` (reduz animações)

## 🛠️ Tecnologias

| Tecnologia | Uso |
|---|---|
| HTML5 | Estrutura semântica |
| CSS3 | Variáveis CSS, Grid, Flexbox, animações, media queries |
| JavaScript (ES6+) | Estado da aplicação, manipulação do DOM, eventos, `localStorage`, `Intl.NumberFormat` |

## 🧠 Conceitos praticados

- **Estado centralizado**: um objeto `estado` guarda tudo o que muda na tela, e as funções de renderização desenham a interface a partir dele
- **Delegação de eventos**: um único ouvinte na lista cuida dos cliques de todos os botões
- Métodos de array: `filter`, `map`, `reduce`, `find` e `sort`
- Formatação de moeda com `Intl.NumberFormat`
- Tratamento de erros com `try/catch` ao usar `localStorage`
- Validação de formulário com expressão regular

## 📂 Estrutura

```
Aurora-Cafe-Loja/
├── index.html   # estrutura da página
├── style.css    # estilos e responsividade
├── script.js    # dados, estado, renderização e eventos
└── README.md
```

## ▶️ Como rodar

Não precisa instalar nada. Baixe o repositório e abra o arquivo `index.html` no navegador.

```bash
git clone https://github.com/Jennifer-silvano/Aurora-Cafe-Loja.git
cd Aurora-Cafe-Loja
# abra o index.html no navegador
```

## 🚀 Próximos passos

- [ ] Página de detalhes do produto
- [ ] Lista de favoritos
- [ ] Migrar para React (componentes `Produto`, `Carrinho` e `Filtros`)
- [ ] Testes automatizados end-to-end com Cypress
- [ ] Consumir produtos de uma API

## 👩‍💻 Autora

**Jennifer Silvano** – [GitHub](https://github.com/Jennifer-silvano) · [LinkedIn](https://www.linkedin.com/in/jennifer-silvano-3993b9246/)
