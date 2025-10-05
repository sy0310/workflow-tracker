// 部门字段配置 - 与数据库完全一致
const DEPARTMENT_FIELDS = {
    '产业分析': [
        { id: 'analysis-type', label: '分析类型', field: '分析类型', type: 'text' },
        { id: 'target-industry', label: '目标行业', field: '目标行业', type: 'text' },
        { id: 'analysis-scope', label: '分析范围', field: '分析范围', type: 'textarea' },
        { id: 'data-sources', label: '数据来源', field: '数据来源', type: 'textarea' },
        { id: 'analysis-method', label: '分析方法', field: '分析方法', type: 'textarea' },
        { id: 'key-findings', label: '关键发现', field: '关键发现', type: 'textarea' },
        { id: 'recommendations', label: '建议措施', field: '建议措施', type: 'textarea' },
        { id: 'risk-factors', label: '风险因素', field: '风险因素', type: 'textarea' }
    ],
    '创意实践': [
        { id: 'creative-type', label: '创意类型', field: '创意类型', type: 'text' },
        { id: 'target-users', label: '目标用户', field: '目标用户', type: 'text' },
        { id: 'creative-concept', label: '创意概念', field: '创意概念', type: 'textarea' },
        { id: 'implementation-plan', label: '实施计划', field: '实施计划', type: 'textarea' },
        { id: 'resource-requirements', label: '资源需求', field: '资源需求', type: 'textarea' },
        { id: 'expected-results', label: '预期效果', field: '预期效果', type: 'textarea' },
        { id: 'innovation-points', label: '创新点', field: '创新点', type: 'textarea' },
        { id: 'feasibility-analysis', label: '可行性分析', field: '可行性分析', type: 'textarea' }
    ],
    '活动策划': [
        { id: 'event-type', label: '活动类型', field: '活动类型', type: 'text' },
        { id: 'target-audience', label: '目标受众', field: '目标受众', type: 'text' },
        { id: 'event-scale', label: '活动规模', field: '活动规模', type: 'text' },
        { id: 'budget-range', label: '预算范围', field: '预算范围', type: 'text' },
        { id: 'event-location', label: '活动地点', field: '活动地点', type: 'text' },
        { id: 'event-time', label: '活动时间', field: '活动时间', type: 'datetime-local' },
        { id: 'event-process', label: '活动流程', field: '活动流程', type: 'textarea' },
        { id: 'promotion-strategy', label: '宣传策略', field: '宣传策略', type: 'textarea' },
        { id: 'material-requirements', label: '物料需求', field: '物料需求', type: 'textarea' },
        { id: 'staff-allocation', label: '人员配置', field: '人员配置', type: 'textarea' }
    ],
    '资源拓展': [
        { id: 'resource-type', label: '资源类型', field: '资源类型', type: 'text' },
        { id: 'target-object', label: '目标对象', field: '目标对象', type: 'text' },
        { id: 'expansion-method', label: '拓展方式', field: '拓展方式', type: 'text' },
        { id: 'resource-value', label: '资源价值', field: '资源价值', type: 'textarea' },
        { id: 'acquisition-difficulty', label: '获取难度', field: '获取难度', type: 'text' },
        { id: 'expected-benefits', label: '预期收益', field: '预期收益', type: 'textarea' },
        { id: 'risk-assessment', label: '风险评估', field: '风险评估', type: 'textarea' },
        { id: 'expansion-plan', label: '拓展计划', field: '拓展计划', type: 'textarea' },
        { id: 'key-contacts', label: '关键联系人', field: '关键联系人', type: 'textarea' },
        { id: 'follow-up-strategy', label: '跟进策略', field: '跟进策略', type: 'textarea' }
    ]
};

// 生成表单HTML的辅助函数
function generateFieldHTML(fieldConfig, value = '', prefix = '') {
    const fieldId = prefix + fieldConfig.id;
    const fieldValue = value || '';
    
    if (fieldConfig.type === 'textarea') {
        return `
            <div class="mb-3">
                <label for="${fieldId}" class="form-label">${fieldConfig.label}</label>
                <textarea class="form-control" id="${fieldId}" rows="3">${fieldValue}</textarea>
            </div>
        `;
    } else if (fieldConfig.type === 'datetime-local') {
        return `
            <div class="mb-3">
                <label for="${fieldId}" class="form-label">${fieldConfig.label}</label>
                <input type="datetime-local" class="form-control" id="${fieldId}" value="${fieldValue}">
            </div>
        `;
    } else {
        return `
            <div class="mb-3">
                <label for="${fieldId}" class="form-label">${fieldConfig.label}</label>
                <input type="text" class="form-control" id="${fieldId}" value="${fieldValue}">
            </div>
        `;
    }
}

// 生成两列布局的字段HTML
function generateTwoColumnFieldsHTML(fields, values = {}, prefix = '') {
    let html = '';
    for (let i = 0; i < fields.length; i += 2) {
        html += '<div class="row">';
        
        // 第一列
        html += '<div class="col-md-6">';
        html += generateFieldHTML(fields[i], values[fields[i].field], prefix);
        html += '</div>';
        
        // 第二列（如果存在）
        if (i + 1 < fields.length) {
            html += '<div class="col-md-6">';
            html += generateFieldHTML(fields[i + 1], values[fields[i + 1].field], prefix);
            html += '</div>';
        }
        
        html += '</div>';
    }
    return html;
}

// 从表单收集字段数据
function collectFieldData(department, prefix = '') {
    const fields = DEPARTMENT_FIELDS[department];
    if (!fields) return {};
    
    const data = {};
    fields.forEach(fieldConfig => {
        const fieldId = prefix + fieldConfig.id;
        const element = document.getElementById(fieldId);
        if (element) {
            data[fieldConfig.field] = element.value || '';
        }
    });
    return data;
}
