# Gestor de Finanzas Personales

Aplicación SPA para registrar, visualizar y analizar ingresos y gastos diarios. Desarrollada con **HTML5**, **Tailwind CSS** y **JavaScript (Vanilla)** aplicando Programación Orientada a Objetos.

> Proyecto del **Hackaton Frontend 2026** — Instituto Superior Santa Rosa de Calamuchita (ISSRC), Programación I, 1er año.

## Funcionalidades

- **Formulario de registro** con descripción, monto, tipo (ingreso o gasto) y categoría.
- **Panel de balance global** con ingresos totales, gastos totales y balance neto, actualizado en tiempo real.
- **Historial de movimientos** en una tabla donde los ingresos se muestran en verde y los gastos en rojo.
- **Resumen por categorías** que agrupa los montos.
- **Eliminación** de movimientos, con recálculo automático de los balances.
- **Diseño responsivo**, pensado primero para móvil (*mobile first*).
- **Bonus:** persistencia de los datos con `localStorage`.

## Tecnologías

| Tecnología | Uso |
|---|---|
| HTML5 | Estructura de la página |
| [Tailwind CSS](https://tailwindcss.com/) (vía CDN) | Estilos y diseño responsivo |
| FontAwesome (vía CDN) | Íconos
| JavaScript (ES Modules) | Lógica, POO y manipulación del DOM |

No se usan frameworks ni librerías de JavaScript.

## Estructura

```
FinanzasPersonales/
├── classes/
│   └── Transaccion.js   # Clase Transaccion y su historial estático
├── styles/
│   └── styles.css       # Solo para el autocompletado de Tailwind en el editor
├── index.html           # Interfaz de la aplicación
├── script.js            # Lógica de la aplicación y manejo del DOM
└── README.md
```

## Alumno

**Daniel Villarreal** - Tecnicatura, ISSRC, 2027.
