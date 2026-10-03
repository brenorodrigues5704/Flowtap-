# FlowTap — MVP 01

Primeira versão funcional do protótipo.

## O que já funciona

- Página pública responsiva.
- Página de demonstração de uma barbearia.
- Painel para cadastrar estabelecimentos.
- Cadastro de nome, logo, Pix, Google, Instagram e WhatsApp.
- Geração automática de um identificador/URL para cada estabelecimento.
- Dados salvos no `localStorage` do navegador.
- QR Code gerado a partir da chave/código Pix cadastrado.
- Botão para copiar a chave Pix.
- Botão "Já paguei" (confirmação MANUAL; não verifica pagamento).
- Link direto para avaliação no Google.

## Como testar

1. Abra `admin.html` no navegador (idealmente pelo Live Server do VS Code).
2. Cadastre um estabelecimento.
3. Clique em "Abrir".
4. Teste a página no celular.
5. Para o cartão NFC, grave no cartão a URL gerada pelo painel.

## Importante

Esta é uma versão de protótipo. O QR Code, nesta etapa, contém o texto da chave/código Pix cadastrado. Para produção, vamos implementar a forma correta de gerar um QR Pix estático (payload EMV) e melhorar segurança, banco de dados, autenticação e publicação.

A confirmação de pagamento é manual nesta versão. Não existe integração com banco/provedor de pagamentos ainda.
