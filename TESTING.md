# Testando o projeto

## Como escrever novos testes

Para escrever novos testes, verifique os arquivos da pasta [spec](./spec) e
adicione os testes em um arquivo exclusivo para a parte do código que deseja
testar.

## Como executar os testes

Para executar os testes, utilize o seguinte comando na pasta raiz do projeto:

```
$ bundle exec rspec
```

Isto irá verificar se os testes estão passando com sucesso e também indicará
a cobertura de código que está sendo obtida.

## Observações

Existem dois arquivos Gemfile, sendo que o Gemfile-ci é o utilizado na execução
de testes, pois nele estão algumas gemas a mais que o Gemfile para resolver a
dependencia de um runtime de JavaScript.
