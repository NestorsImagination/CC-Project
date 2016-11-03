# Introducción

Este proyecto consistirá en la realización de un videojuego multijugador del género shooter básico, usando Unity para desarrollar la parte del cliente y desarrollando una arquitectura de servidor eficaz, la cual sirva para manejar las funciones necesarias del servidor central (iniciar la sesión de los usuarios, consultar y modificar datos de los jugadores, matchmaking, etc.) y para sincronizar los jugadores en varias partidas simultáneas.

# Arquitectura

Se usará (a no ser que se compruebe que otra arquitectura es más adecuada) una arquitectura basada en microservicios. Una parte muy importante de éste sistema es el matchmaking: que al unirse a una partida aparezca una pantalla de espera hasta que un número determinado de jugadores esté también esperando a encontrar partida (4, por ejemplo). En ese momento, el servicio de matchmaking habrá de conectar a estos clientes con uno de los servidores disponibles de juego y, una vez conectados, podrán jugar online, comunicándose entre ellos por medio del servidor de juego devuelto, que además correrá una simulación del juego, de forma que haga los cálculos necesarios y sincronice todos los jugadores (y evite que hagan trampas). La arquitectura quedaría más o menos así (sujeta a cambios de mejora):

![Imagen arquitectura](http://i1152.photobucket.com/albums/p483/Plenidag/Arquitectura_2_zpsb2gvhjpz.png)

En este sistema, el servicio de login (Login Service) se encargaría de acceder a los datos de los usuarios para comprobar que los datos proporcionados por el cliente son correctos, de forma que se abra una sesión del jugador en el Master Server. Éste se encargaría de mantener las sesiones de los jugadores y de redirigir los mensajes de los jugadores y los distintos servicios de forma correcta. El servicio Player Manager se encargará de acceder y manejar la base de datos relativa a los jugadores. El servicio Matchmaker tendrá dos funciones: registrará los servidores disponibles de partidas (World Master), a los que se conectarán los jugadores para jugar entre sí, y aceptará peticiones de los jugadores para entrar en partida. Para mantener un registro de los servidores de partida disponibles se usará un patrón como el definido en esta página: http://microservices.io/patterns/client-side-discovery.html.

Una vez el Matchmaker aloja un número determinado de peticiones de entrar en partida (4, por ejemplo, para una partida 2 vs 2), les habrá de comunicar por medio del Master Server que la partida ha empezado, de forma que éstos cambien a la escena de partida y el World Master seleccionado se disponga a registrar a los jugadores. Los usuarios se conectarán al World Master por medio del Master Server y podrán jugar la partida. Cada World Master se encargará de manejar las funciones de sincronización entre clientes que no requieran de una simulación del "mundo" y de hacer de intermediario entre los clientes y el World Simulator. El World Simulator será desarrollado también con Unity, y se encargará de actualizar el mundo según los inputs enviados por los jugadores, y de pedir al World Master que envíe a los jugadores los datos sobre el estado del mundo periódicamente, de forma que todos los jugadores estén sincronizados.

# Componentes

A continuación aparece una descripción detallada de cada uno de los componentes del sistema:

## Player

Cliente del juego, desarrollado con Unity (puede estar construído como un .exe, un juego de navegador, etc.). Será lo que el jugador ejecute, manejando las entradas y salidas. Se comunicará con el Master Server usando Socket.IO.

## Master Server

Servidor programado en NodeJS (u otro si se encuentra un sistema mejor) al que se conectarán los clientes, y que hará de intermediario entre estos y los demás servicios, redirigiendo los datos de forma correcta. Una vez han iniciado sesión los usuarios, el Master Server mantendrá su sesión abierta hasta que éstos cierren sesión o permanezcan inactivos durante un tiempo prudencial. Además se encargará de manejar el chat del juego.

## Login Service

Se encarga de validar los datos enviados por un cliente para iniciar sesión. Programado en cualquier lenguaje sencillo y eficaz, se comunicará con la base de datos UsersDB (SQL, ya que los datos almacenados serán simplemente una tabla con una entrada por usuario, conteniendo correo electrónico y contraseña, y posiblemente más campos si surge una nueva necesidad), para validar los datos mencionados.

## Player Manager

Hace de intermediario entre el Master Server y la base de datos PlayersDB, accediendo y modificando los datos de ésta según las ordenes del Master Server. Esta base de datos (SQL por ahora por la regularidad de los datos a almacenar en la version a desarrollar, pero modificable a una en NoSQL si se añadieran datos más abundantes e irregulares) guardará la información relativa a los jugadores, incluyendo nombre del jugador en el juego y otros posibles datos como dinero en el juego, items adquiridos, etc..

## Matchmaker

Este servicio, escrito en NodeJS (modificable si se encuentra mejor opción) se encarga de registrar los World Master disponibles (controlando cuántos están disponibles en cada momento) y de aceptar peticiones de jugadores de inicio de partida, de forma que, cuando un número de jugadores concreto haya enviado una petición (4 por ejemplo) y haya por lo menos un World Master disponible, se les comunique a estos jugadores que han entrado en una partida, cambiando su escena a la del juego y conectándolos, por medio del Master Server, con el World Master seleccionado (se devuelve al Master server la dirección de este World Master para que se comunique con él mientras la partida esté en curso), comenzando así una partida. Ese World Master dejará de estar disponible mientras la partida se encuentre en curso.

## World Master

Servidor escrito en NodeJS que tiene un World Simulator asociado. Al iniciarse, comunicará al servicio Matchmaker que se ha iniciado, de forma que quedará disponible para los jugadores a partir de ese momento (quedando registrado). Cuando el Master Server le comunica que se ha iniciado una partida, comunicará al World Simulator que inicie una nueva partida, asociando cada cliente con un "objeto jugador" de la escena diferente. Durante la partida, el World Master realizará la sincronización entre los jugadores que no requiera de una simulación del mundo y hará de intermediario entre el Master Server (y los clientes) y el World Simulator. Una vez acabada la partida, comunicará al Master Server que la partida ha acabado, de forma que quede disponible para iniciar una nueva partida en el Matchmaker.

## World Simulator

Desarrollado con Unity, es un ejecutable que corre un mundo similar al de los clientes (ejecutado de modo que no se vean los gráficos para mejorar el rendimiento, ya que es innecesario) que recibirá los inputs de los clientes a través del World Master (usando Socket.IO) para simular los personajes jugadores y las entidades del mundo de forma sincronizada. También envía periódicamente a los jugadores el estado de las entidades (posición, vida de los jugadores, proyectiles, etc.), de forma que los clientes queden lo más sincronizados posible, y evita que un jugador haga trampas o quede desincronizado por problemas de latencia: es la posición de los jugadores en el World Simulator la que es tomada como real, y si en un cliente se comprueba que la posición del personaje jugador es diferente a la del World Simulator, el personaje jugador se moverá para tomar la posición dada por el World Simulator. Empezará una nueva partida cada vez que el World Master se lo pida, asociando cada cliente con un personaje jugador diferente.
