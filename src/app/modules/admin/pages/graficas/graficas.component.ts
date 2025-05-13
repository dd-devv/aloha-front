import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { VentaService } from '../../../../services/venta.service';
import { ChartModule } from 'primeng/chart';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Fieldset } from 'primeng/fieldset';
import { Select } from 'primeng/select';

@Component({
  selector: 'app-graficas',
  standalone: true,
  imports: [
    ChartModule,
    FormsModule,
    CommonModule,
    Fieldset,
    Select
  ],
  templateUrl: './graficas.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export default class GraficasComponent implements OnInit {

  private ventaService = inject(VentaService);
  ventasChart = this.ventaService.ventasChart;
  platosChart = this.ventaService.platosChart;

  // Usar una propiedad normal en lugar de un signal para el dropdown
  periodo: string = 'meses'; // Opción por defecto
  periodoOptions = [
    { label: 'Meses', value: 'meses' },
    { label: 'Semanas', value: 'semanas' }
  ];

  // Datos para el gráfico de ventas
  ventasData = signal({
    labels: [] as string[],
    datasets: [
      {
        label: 'Ventas',
        backgroundColor: '#22C55E',
        data: [] as number[]
      },
      {
        label: 'Inventario',
        backgroundColor: '#FE5252',
        data: [] as number[]
      }
    ]
  });

  // Opciones para el gráfico de ventas
  ventasOptions = signal({
    maintainAspectRatio: false,
    aspectRatio: 0.8,
    plugins: {
      legend: {
        labels: {
          color: '#737373'
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      },
      y: {
        ticks: {
          color: '#495057'
        },
        grid: {
          color: '#ebedef'
        }
      }
    }
  });

  // Datos para el gráfico de platos
  platosData = signal({
    labels: [] as string[],
    datasets: [
      {
        data: [] as number[],
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#C9CBCF'
        ]
      }
    ]
  });

  // Opciones para el gráfico de platos
  platosOptions = signal({
    plugins: {
      legend: {
        labels: {
          color: '#495057'
        }
      }
    }
  });

  ngOnInit(): void {
    this.obtenerVentasChart();
    this.obtenerPlatosChart();
  }

  cambiarPeriodo() {
    this.obtenerVentasChart();
  }

  obtenerVentasChart() {
    this.ventaService.obtenerVentasChart(this.periodo).subscribe({
      next: (res) => {
        // Asumiendo que res tiene la estructura del ventasChart proporcionado
        const ventasData = this.ventasChart();

        this.ventasData.set({
          labels: ventasData.fechas,
          datasets: [
            {
              label: 'Ventas',
              backgroundColor: '#22C55E',
              data: ventasData.sumVentas
            },
            {
              label: 'Inventario',
              backgroundColor: '#FE5252',
              data: ventasData.inventarios
            }
          ]
        });
      },
      error: (err) => {
        console.error('Error al obtener datos de ventas', err);
      }
    });
  }

  obtenerPlatosChart() {
    this.ventaService.obtenerPlatosChart().subscribe({
      next: (res) => {
        // Asumiendo que res tiene la estructura del platosChart proporcionado
        const platosData = this.platosChart();

        this.platosData.set({
          labels: platosData.platos,
          datasets: [
            {
              data: platosData.ventas,
              backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40',
                '#C9CBCF',
                '#FF6384',
                '#4BC0C0',
                '#9966FF',
              ]
            }
          ]
        });
      },
      error: (err) => {
        console.error('Error al obtener datos de platos', err);
      }
    });
  }
}
