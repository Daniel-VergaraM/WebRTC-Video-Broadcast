
### Herramientas y repositorios usados
#### Herramientas
- [Droidcam (para pruebas)](https://droidcam.app/)
#### Repositorios
- [WebRTC Video Broadcast](https://github.com/TannerGabriel/WebRTC-Video-Broadcast): Se utilizo este repositorio y se le hicieron ciertas modificaciones a los archivos de `broadcast.js` y `watch.js` para la detección automática de una cámara en específico y por medio de esto poder transmitir la señal de video de la cámara seleccionada.

### Uso
Para definir el nombre de la cámara diríjase al archivo `public/broadcast.js` y modifique el valor de la variable `cameraName` con el nombre (en minúsculas) de la cámara que desea usar.
Luego en la terminal ejecute el siguiente comando:
```sh
$ ./run.sh
```
#### Debian/Ubuntu
```sh
$ chmod +x ./run.sh
$ ./run.sh
```
