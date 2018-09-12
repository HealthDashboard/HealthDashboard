# Como contribuir com este projeto

Este documento tem por objetivo ajudar novos desenvolvedores a contribuirem com
este projeto.

## Como montar o ambiente de execução do projeto

Para executar o projeto de health-dashboard, é necessário ter uma máquina com
Rails e PostgreSQL instalado.

Existem duas abordagens para instalar este ambiente:
 * Utilizar uma máquina virtual pré-configurada por scripts;
 * Instalar manualmente as aplicações em uma máquina com Linux.
 
### Instalando o ambiente com uma máquina virtual

Primeiramente é necessário instalar as aplicações VirtualBox e VagrantUp em sua
máquina. Isto deve ser possível independente do sistema operacional que você
está utilizando. A versão recomendada do VirtualBox é 5.2.18 e a do VagrantUp
é a 2.1.2.

Após instalar estes programas, será necessário ativar o suporte a virtualização
na BIOS do seu PC.

Feito isto, basta executar os seguintes comandos dentro da pasta **devenv** do
projeto:

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

Feito isto, basta executar os comandos da seção [Como executar o projeto](#como-executar-o-projeto).

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

```
$ bundle install
```

Uma vez instalado as gemas, crie um usuário no PostgreSQL para a aplicação
acessar o banco de dados com o mesmo nome do usuário atual e com permissões
de super usuário.

```
$ sudo -u postgres createuser --interactive
```

Em seguida execute os comandos para criar o banco de dados e as tabelas:

```
$ rake db:create
$ rake db:migrate
```

Uma vez completados estes passos, deverá ser possível iniciar o projeto com
o comando:

```
$ rails s
```

Inicialmente o projeto não terá uma base de dados populada. Para carregar uma
base de dados, utilize o seguinte comando:

```
$ rake db:seed
```
