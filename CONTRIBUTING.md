# Como contribuir com este projeto

Este documento tem por objetivo ajudar novos desenvolvedores a contribuirem com
este projeto.

## Como montar o ambiente de execução do projeto

O projeto health-dashboard, requer o framework Rails e um banco de dados
PostgreSQL para ser executado. As versões mínimas necessárias destes
aplicativos são:

* PostgreSQL >= 9.5.12
* Rails >= 5.0.1

Existem três opções para ter um ambiente para começar a contribuir com o
projeto:
 * Utilizar o VirtualBox e VagrantUp para criar uma máquina virtual
   pré-configurada;
 * Instalar em uma máquina com Linux os programas docker e docker-compose; 
 * Instalar manualmente os programas em uma máquina com Linux.
 
### Instalando o ambiente usando uma máquina virtual

Primeiramente é necessário instalar as aplicações VirtualBox e VagrantUp em sua
máquina. Isto deve ser possível independente do sistema operacional que você
está utilizando. A versão recomendada do VirtualBox é 5.2.18 e a do VagrantUp
é a 2.1.2.

Importante: Após instalar estes programas, será necessário ativar o suporte a
virtualização na BIOS do seu PC.

Após ter clonado o repositório para sua máquina local, basta executar os
seguintes comandos dentro da pasta **devenv** do projeto:

```
$ vagrant up
```
O comando acima irá iniciar a máquina virtual, criando a mesma caso ainda não
exista. Após este comando ser concluído, a máquina poderá ser acessada
utilizando o comando abaixo.

```
$ vagrant ssh
```

Dentro da pasta home deste usuário, será mapeada a pasta do projeto na máquina
hospedeira, permitindo que arquivos sejam editados fora da máquina virtual e
executados dentro dela.

A máquina virtual contará ainda com a subpasta **devenv/bin** mapeada para a
pasta **bin** na pasta do usuário, adicionando automaticamente os scripts
contidos nela no PATH do usuário. Isto permitirá que o contribuinte do projeto
utilize scripts para execução do PostgreSQL e Rails da mesma forma que
documentado abaixo com docker e docker-compose.

Feito isto, basta executar os comandos da seção [Como executar o projeto](#como-executar-o-projeto).

### Utilizando docker e docker-compose

Para simplificar o processo de configuração do ambiente foram criados scripts
que executam containers para os principais comandos de Rails que o projeto
requer. Através destes scripts, um container com todos os binários e arquivos
necessários é criado e a execução acontece dentro do container, dispensando
a instalação de aplicações na máquina Linux.

O script **bundle** utiliza uma imagem com Ruby versão 2.5 e pode ser utilizado
para fazer o download de todas as gemas que o projeto requer. As gemas baixadas
são armazenadas na pasta **.gems** na pasta do usuário.

Os scripts **rake**, **rails** e **rspec** utilizam a imagem **rails:latest**
que é criada automaticamente pelo script **createRailsImage**, se baseando na
mesma imagem Ruby utilizada pelo comando bundle. Estes scripts requerem um
banco de dados PostgreSQL para serem executados, e o script **startPostgresql**
é utilizado para isto.

O script **startPostgresql** inicia um container com o bando de dados Postgres
versão 10, criando os bancos de dados de desenvolvimento e de testes. Os dados
destes bancos de dados são armazenados na pasta **.psql-container-data** na
pasta do usuário.

Para testar um deploy com uma imagem empacotando toda a aplicação e banco de
dados pode ser utilizado o docker-compose. Para isto basta executar na pasta
principal do projeto os comandos abaixo:

```
$ docker-compose build
```
O comando acima irá criar uma imagem para o health-dashboard empacotando todo
o código e dependências.

```
$ docker-compose up
```
Este comando irá criar um container de PostgreSQL e um container com o
health-dashboard, executando os como se fosse um deploy da aplicação em um
ambiente de homologação ou produção. 

### Instalando o ambiente em uma máquina Linux

Para configurar o projeto em uma máquina com sistema operacional linux primeiro
instalamos o postgreSQL:

```
$ sudo apt-get install postgresql postgresql-contrib
$ sudo apt-get install postgresql-server-dev-9.5
```

Logo, precisamos instalar o rails, para isso fazemos o seguinte. Primeiro,
instalar o rvm, que facilita o controle das versões de ruby, com os seguintes comandos

```
$ sudo apt-get update
$ sudo apt-get install -y curl gnupg build-essential
$ sudo gpg --keyserver hkp://keys.gnupg.net --recv-keys 409B6B1796C275462A1703113804BB82D39DC0E3
$ curl -sSL https://get.rvm.io | sudo bash -s stable
$ sudo usermod -a -G rvm $(whoami)
$ if sudo grep -q secure_path /etc/sudoers; then sudo sh -c "echo export rvmsudo_secure_path=1 >> /etc/profile.d/rvm_secure_path.sh" && echo Environment variable installed; fi
```

Depois, usando rvm podemos instalar o ruby

```
$ rvm install ruby
$ rvm --default use ruby
```

Finalmente, algumas gemas podem precisar do node.js para serem executadas, então, o seguinte comando instala o node.js

```
$ sudo apt-get install -y nodejs && sudo ln -sf /usr/bin/nodejs /usr/local/bin/node
```

## Como executar o projeto

O primeiro passo necessário é instalar todas as gemas que o projeto requer.
Para isto, digite o seguinte comando na pasta raiz do projeto:

```bash
$ bundle install
```

Uma vez instalado as gemas, crie um usuário no PostgreSQL para a aplicação
acessar o banco de dados com o mesmo nome do usuário atual e com permissões
de super usuário.

```bash
$ sudo -u postgres createuser --interactive
```

Em seguida execute os comandos para criar o banco de dados e as tabelas:

```bash
$ rake db:create
$ rake db:migrate
```

Uma vez completados estes passos, deverá ser possível iniciar o projeto com
o comando:

```bash
$ rails s
```

Para acessar o projeto basta acessar em seu navegador a URL
[http://localhost:3000/](http://localhost:3000/).

Inicialmente o projeto não terá uma base de dados populada. Para carregar uma
base de dados, utilize o seguinte comando:

```bash
$ rake db:seed
```

Obs. É necessário carregar na pasta [db/csv](./db/csv) o arquivo procedures.csv
do repositório [Internacoes-Hospitalares](https://gitlab.com/interscity/health-dashboard/Internacoes-Hospitalares).


## Executando testes

Após modificações no código é necessário verificar se os testes estão passando,
além de adicionar testes para toda funcionalidade adicionada. Informações de 
como proceder quanto aos testes podem ser encontradas [aqui](./TESTING.md).
