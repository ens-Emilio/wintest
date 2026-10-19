# Guia de AutomationIds — Para Devs da Aplicação

> AutomationId é o CPF do elemento. Sem ele, teste quebra a cada mudança de texto.

## Convenção
`janela__secao__elemento__tipo` — minúsculas, duplo underline, sufixo de tipo.

Exemplos: `login__form__usuario__input` · `login__form__entrar__button` · `pedido__lista__tabela__grid` · `menu__principal__relatorios__item`

Sufixos: `__button` `__input` `__text` `__grid` `__checkbox` `__item` `__window`

## Regras
- Estável (sem data/random/índice), único na janela, previsível, sem acento/espaço, sem abreviação obscura.
- Obrigatório em: botões, inputs, combos, abas, janelas, mensagens, grids.
- Anti-padrões: `id_12345`, `button_1/button_2`, usar texto visível, usar coordenada, reutilizar ID, `lista__item_0` (use `lista__item__pedido_1024`).

## Validação
Abrir Accessibility Insights → apontar app → conferir AutomationId na árvore.

## Checklist PR
- [ ] Todo interativo tem AutomationId na convenção?
- [ ] Visível no Accessibility Insights?
- [ ] Único na janela?
- [ ] Sem texto/random/índice?
- [ ] Mudança de ID avisada ao QA?
