import React, { useEffect } from 'react';
import * as echarts from 'echarts';

const PieChart = () => {
  useEffect(() => {
    const chartDom = document.getElementById('pie-chart');
    const myChart = echarts.init(chartDom);

    const option = {
      title: {
        text: 'A Case of Doughnut Chart',
        left: 'left',
        top: 'top',
      },
      tooltip: {
        trigger: 'item',
      },
      series: [
        {
          type: 'pie',
          data: [
            { value: 335, name: 'A' },
            { value: 234, name: 'B' },
            { value: 1548, name: 'C' },
          ],
          radius: ['40%', '70%'],
          itemStyle: {
            borderRadius: 10,
            borderColor: '#fff',
            borderWidth: 2,
          },
        },
      ],
    };

    myChart.setOption(option);

    // Resize the chart when the window is resized
    window.addEventListener('resize', myChart.resize);

    return () => {
      window.removeEventListener('resize', myChart.resize);
      myChart.dispose();
    };
  }, []);

  return <div id="pie-chart" style={{ width: '100%', height: '400px' }}></div>;
};

export default PieChart;
