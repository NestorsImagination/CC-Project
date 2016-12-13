# Provisionamiento con Vagrant

## Provisionamiento para máquinas virtuales

Para provisionar máquinas virtuales con Vagrant, una vez instalado Vagrant (junto con una máquina virtual como VirtualBox) descargar los archivos de esta carpeta y colocarlos en una carpeta cualquiera. Ejercutar "vagrant -n(número de Game Worlds) up" para realizar el provisionamiento. Por ejemplo, si se quiere ejecutar creando 5 Game Worlds (hasta 5 partidas simultáneas) se haría "vagrant -n5 up". Se ejecutará Vagrant:

![Ejecución Vagrant](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/VagrantShooterUp.png)

Una vez completado, se habrán creado y configurado con Ansible todas las máquinas virtuales necesarias:

![Máquinas virtuales creadas](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/VagrantShooterUp2.png)

![Máquinas en Vagrant](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/VagrantShooterUp3.png)

Se puede entrar a cualquiera de las máquinas con "vagrant ssh (nombre de la máquina)". Por ejemplo, al hacer "vagrant ssh master" se puede entrar al servidor maestro. Como se puede comprobar en la siguiente imagen, se ha configurado la máquina correctamente:

![Master Server](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/VagrantShooterUp4.png)
