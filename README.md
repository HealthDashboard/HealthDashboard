# InternaSUS

Uma aplicação para visualização espacial de dados de internações hospitalares da cidade de São Paulo.

## Banco de dados

Para popular o banco de dados, a pasta `db/csv` deve conter os seguintes CSVs:  
-  procedures.csv
-  specialties.csv
-  health_centres_real.csv

Com isso, podemos seguir com os comandos abaixo:
```console
rake db:drop
```
```console
rake db:create
```
```console
rake db:migrate
```
```console
rake db:seed
```

Além disso, os arquivos ruby da pasta `scripts` devem ser executados, um por um, da seguinte maneira:

```console
$ bundle exec ruby <nome_do_arquivo.rb>
```
Com base nos dados adicionados, esses scripts criarão arquivos json que serão consumidos ao longo da aplicação.

## Cobertura de testes

Development:
[![pipeline status](https://gitlab.com/interscity/health-dashboard/health-smart-city/badges/development/pipeline.svg)](https://gitlab.com/interscity/health-dashboard/health-smart-city/commits/master)
[![coverage report](https://gitlab.com/interscity/health-dashboard/health-smart-city/badges/development/coverage.svg)](https://gitlab.com/interscity/health-dashboard/health-smart-city/commits/master)

Master:
[![pipeline status](https://gitlab.com/interscity/health-dashboard/health-smart-city/badges/master/pipeline.svg)](https://gitlab.com/interscity/health-dashboard/health-smart-city/commits/master)
[![coverage report](https://gitlab.com/interscity/health-dashboard/health-smart-city/badges/master/coverage.svg)](https://gitlab.com/interscity/health-dashboard/health-smart-city/commits/master)

## O InternaSUS

É possível acessar o InternaSUS através dos seguintes links:

**Produção:** [http://interscity.org/apps/saude](http://interscity.org/apps/saude)

**Homologação:** [http://teste.healthdashboard.interscity.org](http://teste.healthdashboard.interscity.org)

### Contribuindo

Informações sobre como contribuir com o projeto podem ser encontradas [aqui](./CONTRIBUTING.md).
