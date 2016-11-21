# Provisionamiento

He usado una máquina en AWS EC2 de Ubuntu para probar el provisionamiento mediante Ansible:

![Captura máquina AWS Ubuntu](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Maquina.png)

Una vez creada, me conecto con "ssh -i CCDPG0.pem ubuntu@ec2-35-156-54-87.eu-central-1.compute.amazonaws.com", siendo CCDPG0 la clave que me proporcionó AWS al crear la instancia. Al conectarme, creo las carpetas "Provision" y "project". Creo una clave ssh con "ssh-keygen -t rsa -b 4096 -C 'email'". Una vez creada (dos archivos, uno de ellos terminado en .pub) la añado al agente ssh usando "eval "$(ssh-agent -s)" y a continuación "ssh-add 'clave'", siendo 'clave' el archivo generado que no acaba en .pub. En Github, en la pestaña Configuración del repositorio (NestorsImagination/Sample-Multiplayer-Shooter), en el apartado Deploy keys, añado la clave.pub generada.

Lo siguiente es instalar Ansible. Para ello uso:

* sudo apt-get install software-properties-common
* sudo apt-add-repository ppa:ansible/ansible
* sudo apt-get update
* sudo apt-get install ansible

Para configurar Ansible, en la carpeta "/etc/ansible" hay que modificar "ansible.cfg" para que "sudo\_user" sea el usuario root del sistema (por defecto "root", pero en estas máquinas se llama "ubuntu"). Sustituir el archivo "hosts" por el que se encuentra en este repositorio. Crear una carpeta "group\_vars" y pegar en ella el archivo "app.yml" que se encuentra en este repositorio.

De vuelta a la carpeta Provision, pegar el archivo Playbook.yml de este repositorio (recordar que lo que se desea es aprovisionar un sistema que usará Node.js principalmente en su implementación). Por último, usar el comando "ansible-playbook Playbook.yml" para ejecutar Ansible. Esto da un output como este:

![Ejecución ansible-playbook Playbook.yml](https://raw.githubusercontent.com/NestorsImagination/Sample-Multiplayer-Shooter/master/Provision/Screenshots/Ansible.png)

Con esto queda el sistema provisionado de forma básica (cuando el sistema esté desarrollado habrá que añadir más instrucciones para provisionarlo de forma completa).

# Notas

He utilizado Ansible ya que parecía ser el más recomendado, pero podría haber usado otro cualquiera.

# Enlaces seguidos

* https://help.github.com/articles/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent/
* https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/AccessingInstancesLinux.html
* http://www.mbejda.com/deploying-node-applications-with-ansible/
* https://adamcod.es/2014/09/23/vagrant-ansible-quickstart-tutorial.html
* http://docs.ansible.com/ansible/guide_aws.html
* Otros varios
