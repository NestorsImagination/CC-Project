# Prototipo final

## Introducción

Para el prototipo final (carpeta "Prototype" he desarrollado los diferentes servicios del sistema, usando Node.js y Socket.io, además de páginas HTMl para hacer una muestra de su funcionamiento. Se ha empleado una arquitectura de microservicios. El sistema de ficheros final está estructurado de forma que cada servicio está empaquetado en una carpeta, con todos sus archivos necesarios, junto con un Dockerfile, y además se ha creado un Vagrantfile en la carpeta raíz (Prototype).

En concreto, se han desarrollado los siguientes servicios:

* MasterServer: El servicio principal, el cual se encarga de enviar las páginas HTML al usuario, proporcionar las funciones básicas y hacer de enlace entre el usuario y los demás servicios.
* LoginService: Servicio que se comunica con la base de datos Mongo para registrar usuario y comprobar la correctitud de los datos enviados para iniciar sesión.
* Matchmaker: Servicio que contiene una lista de los GameWorld disponibles, junto con su nombre y dirección, y que se encarga de recibir peticiones de jugadores buscando partida desde el MasterServer, asignándolos a los WorldMaster disponibles y comunicando al WorldMaster que inicie una partida cuando todos los plazos disponibles en un WorldMaster se hayan ocupado por jugadores, enviándole el nombre y la dirección de ese WorldMaster para ello. Si no hay ningún WorldMaster disponible cuando un jugador busca una partida, queda comprobando periódicamente si algún WorldMaster queda disponible, añadiendo el jugador a ese WorldMaster en tal caso.
* WorldMaster: Un "mundo de juego", donde los jugadores se conectarían, a través del MasterServer, para comunicarse y sincronizar sus ordenadores durante una partida. Al iniciarse, avisa al Matchmaker de que queda disponible para iniciar partidas en él. Cuando acepta una partida le avisa de que queda ocupado hasta que acabe la partida, de forma que no se puedan iniciar nuevas partidas.

También se ha configurado una cuenta en mLab, conteniendo una base de datos de los usuarios añadidos al sistea.

_Nota: En este prototipo se ha ignorado el servicio que fue llamado "PlayerManager", ya que no aportaría mucho por ahora._ 

En definitiva, el diagrama que reflejaría la arquitectura del prototipo final sería el siguiente:

![Arquitectura del prototipo](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/SMPS_Prototype_Architecture.png)

## El prototipo

Una vez desplegado, accediendo a la dirección del MasterServer se entra en la página inicial:

![Página inicial](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Intro.png)

Aquí el usuario puede iniciar sesión o registrar un nuevo usuario. Una vez iniciada sesión con datos correctos, es redireccionado al "lobby", la sala donde se encuentran los jugadores que no están en una partida:

![Lobby](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Lobby.png)

Aquí puede hablar con los demás usuarios que se encuentren en esta sala. Se puede buscar partida pulsando el botón correspondiente, pero no iniciará hasta que el número necesario de jugadores estén buscando partida (2, en este caso) y haya algún WorldMaster disponible:

![Lobby buscando partida](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Lobby_2.png)

Una vez el número necesario de jugadores están buscando partida (Juan le da a buscar partida), los dos jugadores son redireccionados a la página de la partida, donde pueden seguir comunicándose entre ellos (y con cualquier otro jugador en la partida si estas fueran de más de dos jugadores), pero no con los usuarios que siguieran en el lobby:

![Partida](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Match.png)

En este caso, se desplegó el sistema con un solo World Master, por lo que ningún usuario más podrá entrar en partida hasta que este quede libre (por ejemplo, si hubieran dos World Master y cada partida fuera de 4 jugadores, el número máximo que podrían jugar a la vez sería de 2x4=8):

![No se encuentra partida](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Lobby_3.png)

Los jugadores pueden salir de la partida y volver al lobby, pero el World Master no quedará libre hasta que todos los jugadores hayan salido de la partida:

![Un jugador sale de la partida](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Lobby_4.png)

Una vez todos los jugadores han salido de la partida, una nueva partida comienza automáticamente para los jugadores en espera:

![La partida termina y comienza una nueva](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Match_2.png)

## Cómo desplegar

_Nota: Se da por hecho que se tiene Vagrant, Docker y Docker-Machine corréctamente instalados (y una cuenta disponible de AWS, pero es opcional)_

_Nota 2: Se recomienda trabajar en modo superusuario temporalmente para evitar molestias y problemas_

Descargar la carpeta 'Prototype'. Crear una docker-machine con el siguiente comando (región al gusto):

```
docker-machine create --driver amazonec2 --amazonec2-region eu-central-1 aws-docker-machine
```

Comprobar en la consola de AWS que la máquina está corriendo correctamente y usar el siguiente comando para activar la nueva máquina:

```
eval $(docker-machine env aws-docker-machine)
```

Comprobar con el siguiente comando que la nueva máquina está activada:

```
docker-machine active
```

Se puede comprobar que se puede conectar correctamente a la máquina AWS usando 'docker-machine ssh aws-docker-machine'. Ejecutar el siguiente comando para crear una red interna que conecte todos los servicios entre sí, de forma que se puedan comunicar:

```
docker-machine ssh aws-docker-machine -- docker network create SMPS -d bridge --subnet 172.25.0.0/16
```

_Nota: También se puede ejecutar el comando 'docker network create SMPS -d bridge --subnet 172.25.0.0/16' desde dentro de la máquina AWS, tras conectarse con SSH_

_Nota 2: La subnet puede ser la que se desee, siempre que sea válida_

Una vez hecho esto, se puede comprobar que la red ha sido creada satisfactoriamente usando el siguiente comando:

```
docker network inspect SMPS
```

Debería dar un resultado parecido a este:

![La partida termina y comienza una nueva](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Network.png)

Ejecutar el siguiente comando para desplegar el sistema:

```
vagrant -n1 -p2 -a"172.25.0" up --no-parallel
```

Los argumentos son:

* n(x): El número de World Masters
* p(x): El número de jugadores por partida
* a(xxx.xxx.xxx): Los primeros tres números de la subnet

Una vez ejecutado, si ha habido éxito, al conectarse al servidor AWS (con docker ssh 'aws-docker-machine') al ejecutar 'curl localhost:3000' debería aparecer una cadena de texto grande, la página web inicial. Quedan dos pasos antes de poder acceder públicamente. Primero se debe acceder, en la página de gestion de instancias EC2 de AWS, al grupo de seguridad asociado a la máquina (en Security Groups, por defecto 'docker-machine'): 

![Grupo de seguridad](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Security.png)

Se debe añadir una regla que abra la máquina a peticiones HTTP, como se ve en la imagen.

El último paso es ejecutar en la terminal el siguiente comando:

```
docker-machine ssh aws-docker-machine -- sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
```

O este otro alternativo si se está conectado a la máquina por medio de 'docker-machine ssh':

```
sudo iptables -A PREROUTING -t nat -i eth0 -p tcp --dport 80 -j REDIRECT --to-port 3000
```

Una vez hecho esto, si todo ha ido bien, será posible acceder al servidor por medio del DNS público (o la IP pública) que se muestra al seleccionar la máquina:

![Grupo de seguridad](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Public.png)

![Grupo de seguridad](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Pics/Proto_Connect.png)

Con esto queda por desplegado el prototipo del servidor de juego multijugador online.
