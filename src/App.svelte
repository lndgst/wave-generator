<script>
  import { generateSineWave, exportToCSV, downloadCSV } from './waveGenerator.js';
  import Slider from './lib/Slider.svelte';
  import * as Chart from './lib/ui/chart/index.js';
  import * as Dialog from './lib/ui/dialog/index.js';
  import Button from './lib/ui/button/button.svelte';
  import Input from './lib/ui/input/input.svelte';
  import Switch from './lib/ui/switch/switch.svelte';
  import { LineChart } from 'layerchart';
  import { scaleLinear } from 'd3-scale';
  import { curveNatural } from 'd3-shape';

  // Reactive state - using arrays for bits-ui Slider
  let amplitudeValue = $state([1]);
  let frequencyValue = $state([1]);
  let phaseValue = $state([0]);
  let sampleRateValue = $state([50]);
  let durationValue = $state([1]);

  let currentWaveData = $state([]);
  let exportDialogOpen = $state(false);
  let exportFilename = $state('sine_wave');
  let includeTimestamp = $state(true);

  // Extract values from arrays using $derived
  let amplitude = $derived(amplitudeValue[0]);
  let frequency = $derived(frequencyValue[0]);
  let phase = $derived(phaseValue[0]);
  let sampleRate = $derived(sampleRateValue[0]);
  let duration = $derived(durationValue[0]);

  // Chart configuration
  const chartConfig = {
    value: { label: "Amplitude", color: "#000000" }
  };

  const chartSeries = [{
    key: "value",
    label: "Sine Wave",
    color: "#000000"
  }];

  // Prepare data for chart (convert to format expected by LineChart)
  let chartData = $derived(currentWaveData.map(point => ({
    time: point.time,
    value: point.value
  })));

  function openExportDialog() {
    if (currentWaveData.length === 0) {
      alert('Please generate a wave first!');
      return;
    }
    exportDialogOpen = true;
  }

  function handleExport() {
    const csvData = exportToCSV(currentWaveData, includeTimestamp);
    downloadCSV(csvData, `${exportFilename}.csv`);
    exportDialogOpen = false;
  }

  // Automatically regenerate wave when parameters change
  $effect(() => {
    const amp = amplitude;
    const freq = frequency;
    const ph = phase;
    const sr = sampleRate;
    const dur = duration;

    requestAnimationFrame(() => {
      const data = generateSineWave(amp, freq, ph, sr, dur);
      currentWaveData = data;
    });
  });
</script>

<div class="bg-background text-foreground min-h-screen p-xl font-mono normal-case">
  <div class="max-w-[960px] mx-auto">

    <!-- Visualization at top -->
    <div class="mb-xl">
      <span class="block mb-xl">Sine Wave Generator</span>
      <div class="w-full">
        <Chart.Container config={chartConfig} class="h-[400px] w-full bg-muted rounded p-6">
          <LineChart
            data={chartData}
            x="time"
            xScale={scaleLinear()}
            yScale={scaleLinear().domain([-10, 10]).nice(false)}
            yDomain={[-10, 10]}
            series={chartSeries}
            props={{
              spline: { curve: curveNatural, strokeWidth: 1 },
              xAxis: {
                format: (v) => Math.round(v).toString()
              },
              yAxis: {
                format: (v) => Math.round(v).toString(),
                ticks: [-10, -5, 0, 5, 10]
              },
              grid: {
                x: true,
                y: true
              }
            }}
          >
            {#snippet tooltip()}
              <Chart.Tooltip hideLabel />
            {/snippet}
          </LineChart>
        </Chart.Container>
      </div>
    </div>

    <!-- Controls and button underneath -->
    <div class="flex items-start justify-between">
      <div class="space-y-lg w-64">
        <div>
          <span class="block mb-sm">
            Amplitude: {amplitude.toFixed(1)}
          </span>
          <Slider
            bind:value={amplitudeValue}
            min={0.1}
            max={10}
            step={0.1}
          />
        </div>

        <div>
          <span class="block mb-sm">
            Frequency (Hz): {frequency.toFixed(1)}
          </span>
          <Slider
            bind:value={frequencyValue}
            min={0.1}
            max={20}
            step={0.1}
          />
        </div>

        <div>
          <span class="block mb-sm">
            Phase (radians): {phase.toFixed(2)}
          </span>
          <Slider
            bind:value={phaseValue}
            min={0}
            max={2 * Math.PI}
            step={0.1}
          />
        </div>

        <div>
          <span class="block mb-sm">
            Sample Rate (points/sec): {sampleRate}
          </span>
          <Slider
            bind:value={sampleRateValue}
            min={10}
            max={1000}
            step={10}
          />
        </div>

        <div>
          <span class="block mb-sm">
            Duration (seconds): {duration.toFixed(1)}
          </span>
          <Slider
            bind:value={durationValue}
            min={0.1}
            max={10}
            step={0.1}
          />
        </div>
      </div>
      <Button variant="outline" onclick={openExportDialog}>
        Export CSV
      </Button>
    </div>

    <!-- Export Dialog -->
    <Dialog.Root bind:open={exportDialogOpen}>
      <Dialog.Content class="p-6 flex flex-col">
        <h3 class="text-lg font-medium mb-4">Export CSV</h3>

        <div class="mb-4">
          <label for="filename" class="block text-sm mb-2">
            Filename
          </label>
          <Input
            id="filename"
            type="text"
            bind:value={exportFilename}
            placeholder="sine_wave"
          />
        </div>

        <div class="flex items-center justify-between mb-4">
          <label class="text-sm normal-case">Include Timestamp</label>
          <Switch bind:checked={includeTimestamp} />
        </div>

        <div class="flex justify-end mt-auto">
          <Button onclick={handleExport}>
            Save
          </Button>
        </div>
      </Dialog.Content>
    </Dialog.Root>
  </div>
</div>
