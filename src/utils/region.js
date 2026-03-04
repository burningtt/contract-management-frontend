const REGION_MAP = {
  'XFQ': '忻府区',
  'YPS': '原平市',
  'DXX': '定襄县',
  'WTX': '五台县',
  'DZX': '代县',
  'FSX': '繁峙县',
  'JLX': '静乐县',
  'NWX': '宁武县',
  'SCX': '神池县',
  'WZX': '五寨县',
  'KLX': '岢岚县',
  'BDX': '保德县',
  'HQX': '河曲县',
  'PGX': '偏关县'
}

const REGION_CODE_MAP = {
  '忻府区': 'XFQ',
  '原平市': 'YPS',
  '定襄县': 'DXX',
  '五台县': 'WTX',
  '代县': 'DZX',
  '繁峙县': 'FSX',
  '静乐县': 'JLX',
  '宁武县': 'NWX',
  '神池县': 'SCX',
  '五寨县': 'WZX',
  '岢岚县': 'KLX',
  '保德县': 'BDX',
  '河曲县': 'HQX',
  '偏关县': 'PGX'
}

const REGION_OPTIONS = [
  { label: '忻府区', value: 'XFQ' },
  { label: '原平市', value: 'YPS' },
  { label: '定襄县', value: 'DXX' },
  { label: '五台县', value: 'WTX' },
  { label: '代县', value: 'DZX' },
  { label: '繁峙县', value: 'FSX' },
  { label: '静乐县', value: 'JLX' },
  { label: '宁武县', value: 'NWX' },
  { label: '神池县', value: 'SCX' },
  { label: '五寨县', value: 'WZX' },
  { label: '岢岚县', value: 'KLX' },
  { label: '保德县', value: 'BDX' },
  { label: '河曲县', value: 'HQX' },
  { label: '偏关县', value: 'PGX' }
]

function getRegionName(code) {
  if (!code) return '-'
  return REGION_MAP[code] || '未知地区'
}

function getRegionCode(name) {
  if (!name) return ''
  return REGION_CODE_MAP[name] || ''
}

export {
  REGION_MAP,
  REGION_CODE_MAP,
  REGION_OPTIONS,
  getRegionName,
  getRegionCode
}
