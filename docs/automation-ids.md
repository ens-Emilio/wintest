# Guia de AutomationIds | AutomationIds Guide | Guía de AutomationIds

> **PT-BR** · [English](#english) · [Español](#español) — Convenção `janela__secao__elemento__tipo`

---

## PT-BR

AutomationId é o CPF do elemento — identificador único, estável, invisível ao usuário. Sem ele, o teste quebra a cada mudança de texto.

**Convenção:** `janela__secao__elemento__tipo` — minúsculas, duplo underline, sufixo de tipo.
Ex: `login__form__usuario__input` · `login__form__entrar__button` · `pedido__lista__tabela__grid`

**Obrigatório em:** botões, inputs, combos, abas, janelas, mensagens, grids.

**Anti-padrões:** `id_12345`, `button_1/2`, usar texto visível, coordenada X/Y, índice de lista.

Valide com **Accessibility Insights** — o AutomationId deve aparecer na árvore.

---

## English

AutomationId is the element's SSN — unique, stable, invisible to the user. Without it, tests break on every text change.

**Convention:** `window__section__element__type` — lowercase, double underscore, type suffix.
Ex: `login__form__user__input` · `login__form__login__button` · `order__list__table__grid`

**Required on:** buttons, inputs, combos, tabs, windows, messages, grids.

**Anti-patterns:** `id_12345`, `button_1/2`, visible text, X/Y coords, list index.

Validate with **Accessibility Insights** — AutomationId must appear in the tree.

---

## Español

AutomationId es el DNI del elemento — identificador único, estable, invisible al usuario. Sin él, la prueba se rompe con cada cambio de texto.

**Convención:** `ventana__seccion__elemento__tipo` — minúsculas, doble guion bajo, sufijo de tipo.
Ej: `login__form__usuario__input` · `login__form__entrar__button` · `pedido__lista__tabla__grid`

**Obligatorio en:** botones, inputs, combos, pestañas, ventanas, mensajes, grids.

**Anti-patrones:** `id_12345`, `button_1/2`, texto visible, coordenadas X/Y, índice de lista.

Valide con **Accessibility Insights** — el AutomationId debe aparecer en el árbol.
