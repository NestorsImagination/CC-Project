# Creación de un entorno de pruebas con Docker

Se supone que Docker está instalado correctamente en la máquina a usar. Para que no haya problemas se recomienda usar todos los comandos especificados con el usuario "root" (sudo su).

## Creación de una máquina con docker-machine

Se puede comenzar creando una máquina Docker con docker-machine (se debe instalar adicionalmente) para conectar con el servidor en el que se desplegará el entorno, aunque es opcional. Por ejemplo, en el caso de AWS, se debe crear un archivo /root/.aws/credentials con el siguiente contenido:

```
aws\_access\_key\_id = **************
aws\_secret\_access\_key = *************
```

Luego usar el comando

```
docker-machine create --driver amazonec2 --amazonec2-region "región" "nombre de la máquina"
```

Por ejemplo:

![Docker Machine AWS](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/DockerMachineAWS.png)

Se puede ver en la consola de AWS que se ha creado la instancia correspondiente:

![Docker Machine AWS Instance](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/DockerAWSInstance.png)

Luego se ha de usar el comando

```
eval $(docker-machine env "nombre de la máquina")
```

para activar la máquina creada. Por ejemplo:

![Docker Machine AWS](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/DockerMachineAWS_2.png)

## Creación del entorno de pruebas con Docker

Descargar el contenido de la carpeta "Docker" de este repositorio. Moverse en la terminal a la carpeta y usar el siguiente comando:

```
vagrant -n"número de mundos de juego" up --provider=docker
```

Por ejemplo:

```
vagrant -n2 up --provider=docker
```

Tras unos momentos, el entorno quedará creado. Con "docker ps -a" se pueden listar los contenedores creados:

![Entorno creado](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Docker_Vagrant_Up.png)

Se puede conectar con la máquina con "docker-machine ssh "nombre de la máquina" para comprobar que todo funciona correctamente:

![Entorno creado](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Docker_AWS_Prueba.png)
