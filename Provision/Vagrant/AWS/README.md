# Provisionamiento con Vagrant

## Provisionamiento para AWS

Una vez instalado el plugin vagrant-aws, descargar los archivos de la carpeta /Provision/Vagrant/AWS y colocarlos en una carpeta. Se debe configurar la cuenta de AWS, creando un grupo de seguridad llamado "Vagrant" con permisos suficientes, crear un Key Pair, descargando los archivos correspondientes, y modificar el archivo Vagrantfile dando valor a las siguientes variables:

accessKeyID (Añadir Access Key ID)
secretKey (Añadir Secret Key)
keyPairName (Añadir nombre del Key Pair)
privateKey (Añadir ruta desde este directorio a la Private Key)

Ejecutar con vagrant -n(número de Game Worlds) up --provider=aws. Es posible que aparezca un error de Ansible que contenga "...too long for Unix domain socket...". En tal caso, seguir las instrucciones de este enlace: https://goinggnu.wordpress.com/2015/07/07/solution-for-too-long-for-unix-domain-socket-with-ansible-and-amazon-ec2/. También es posible que surjan errores de Ansible diciendo que hay problemas relacionados con la ejecución paralela (que no son fatales). En tal caso, ejecutar "vagrant provision" y puede que se arregle. Si todo va bien, se habrán creados las máquinas en AWS:

![Máquinas creadas en AWS](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/AWS_UP.png)

Conectándose a una de las máquinas con "Vagrant ssh (nombre de la máquinas)", por ejemplo "Vagrant ssh master" para conectar con el Master Server, se puede comprobar que se ha creado y configurado correctamente:

![Master Server AWS](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Vagrant_AWS_Master.png)
