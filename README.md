# Dashboard da Saúde

Uma aplicação para visualização espacial de dados de internações hospitalares da cidade de São Paulo.
### Requerimentos
---
* PostgreSQL >= 9.5.12
* Rails >= 5.0.1

### Setup
---
Instalar dependências necessárias.
```bash
$ bundle install
```

Criar e popular o banco de dados.
```bash
$ rake db:create
$ rake db:migrate
$ rake db:seed
```
A aplicação está pronta para ser executada.
```bash
$ rails s
```

A aplicação pode ser acessada em http://localhost:3000

---

É possível acessar uma versão da aplicação em http://interscity.org/apps/saude 
