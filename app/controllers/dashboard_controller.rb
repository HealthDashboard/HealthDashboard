class DashboardController < ApplicationController

  def initialize
    # Variables to show in select of charts
    @select_text = ["Estabelecimento de Ocorrência", "Competência (aaaamm)", "Grupo do procedimento autorizado", "Especialidade do leito", "Caráter do atendimento",
      "Diagnóstico principal (CID-10)", "Diagnóstico secundário (CID-10)", "Diagnóstico secundário 2 (CID-10)", "Complexidade", 
      "Tipo de financiamento", "Faixa etária", "Raça/Cor", "Nível de instrução", "Distrito Administrativo", "Subprefeitura", 
      "Supervisão Técnica de Saúde", "Coordenadoria Regional de Saúde", "Gestão", "Total geral de diárias", "Diárias UTI", 
      "Diárias UI", "Dias de permanência", "Valor da parcela", "Distância de deslocamento(Km)"]
    @select_values = ["cnes_id", "cmpt", "proce_re", "specialty_id", "treatment_type", "cid_primary", "cid_secondary", "cid_secondary2",
      "complexity", "finance", "age_code", "race", "lv_instruction", "DA", "PR", "STS", "CRS", "gestor_ide", "days", "days_uti", "days_ui", 
      "days_total", "val_total", "distance"]
    super
  end

  # get '/'
  def index
  end

end
