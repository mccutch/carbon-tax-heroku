def get_tax_types(request):
    emissions = request.user.emissions.all()
    taxes_used = []
    for emission in emissions:
        if not emission.tax_type:
            continue
        if not emission.tax_type.id in taxes_used:
            taxes_used.append(emission.tax_type.id)
    return taxes_used

def get_months(request):
    emissions = request.user.emissions.all()
    payments = request.user.payments.all()
    months = []
    
    if (len(emissions) == 0) and (len(payments) == 0):
        return months

    first_date = None
    last_date = None
    
    for emission in emissions:
        if first_date == None:
            first_date = emission.date
            last_date = emission.date
            continue
        if emission.date<first_date:
            first_date = emission.date
        elif emission.date>last_date:
            last_date = emission.date

    for payment in payments:
        if first_date == None:
            first_date = payment.date
            last_date = payment.date
            continue
        if payment.date<first_date:
            first_date = payment.date
        elif payment.date>last_date:
            last_date = payment.date

    i_year = first_date.year
    i_month = first_date.month
    
    while(not(i_year>=last_date.year and i_month>last_date.month)):
        if i_month>12:
            i_month=1
            i_year+=1

        new_month = {'year':i_year, 'month':i_month}
        if not new_month in months:
            months.append(new_month)
        i_month+=1

    months.sort(key=lambda x: (x['year'], x['month']))
    return months

def get_emissions_by_tax(request):
    emissions_by_tax = {}
    emissions_by_tax["total"]={}
    tax_types = get_tax_types(request)

    co2_total = 0
    price_total = 0

    for tax_type in tax_types:
        emissions_by_tax[tax_type] = {}
        emissions = request.user.emissions.filter(tax_type=tax_type)
        co2_tax_total = 0
        price_tax_total = 0
        for emission in emissions:
            #print(emission.co2_output_kg)
            co2_tax_total += emission.co2_output_kg
            price_tax_total += emission.price*request.user.profile.conversion_factor

        emissions_by_tax[tax_type]['co2_kg']=co2_tax_total
        emissions_by_tax[tax_type]['price']=price_tax_total
        co2_total += co2_tax_total
        price_total += price_tax_total

    emissions_by_tax['total']['co2_kg']=co2_total
    emissions_by_tax['total']['price']=price_total
    return emissions_by_tax

def get_emissions_by_month_and_tax(request):
    emissions_by_month_and_tax  = {}
    
    months = get_months(request)
    tax_types = get_tax_types(request)

    for month in months:
        thisMonth = month['month']
        thisYear = month['year']
        monthString=f'{thisYear}-{thisMonth}'

        emissions_by_month_and_tax[monthString] = {}
        co2_month_total=0
        price_month_total=0

        emissions_by_month_and_tax[monthString]['total'] = {}
        for tax_type in tax_types:
            emissions = request.user.emissions.filter(tax_type=tax_type)
            emissions_by_month_and_tax[monthString][tax_type] = {}

            co2_total = 0
            price_total = 0
            for emission in emissions:
                if(emission.date.year==thisYear and emission.date.month==thisMonth):
                    co2_total += emission.co2_output_kg
                    price_total += emission.price*request.user.profile.conversion_factor

            
            emissions_by_month_and_tax[monthString][tax_type]['co2_kg']=co2_total
            emissions_by_month_and_tax[monthString][tax_type]['price']=price_total
            co2_month_total += co2_total
            price_month_total += price_total

        emissions_by_month_and_tax[monthString]['total']['co2_kg']=co2_month_total
        emissions_by_month_and_tax[monthString]['total']['price']=price_month_total

    return emissions_by_month_and_tax

def get_cumulative_payments_by_month(request):
    payments_by_month  = {}
    
    months = get_months(request)
    emissions = request.user.emissions.all()
    payments = request.user.payments.all()
    conversion_factor = request.user.profile.conversion_factor

    tax_total=0
    payment_total=0

    for month in months:
        thisMonth = month['month']
        thisYear = month['year']
        monthString=f'{thisYear}-{thisMonth}'

        payments_by_month[monthString] = {}
        
        for emission in emissions:
            if(emission.date.year==thisYear and emission.date.month==thisMonth):
                tax_total += emission.price*conversion_factor
        for payment in payments:
            if(payment.date.year==thisYear and payment.date.month==thisMonth):
                payment_total += payment.amount*conversion_factor
            
        payments_by_month[monthString]['tax']=tax_total
        payments_by_month[monthString]['paid']=payment_total

    return payments_by_month

def get_summary(request):
    total_paid = 0
    total_tax = 0
    total_co2 = 0
    total_distance = 0

    emissions = request.user.emissions.all()
    for emission in emissions:
        total_tax += emission.price*request.user.profile.conversion_factor
        total_co2 += emission.co2_output_kg
        total_distance += emission.distance

    payments = request.user.payments.all()
    for payment in payments:
        total_paid += payment.amount*request.user.profile.conversion_factor

    return {
        'total_paid':total_paid,
        'total_tax':total_tax,
        'balance':total_tax-total_paid,
        'total_co2':total_co2,
        'total_distance':total_distance,
        'currency':request.user.profile.currency,
    }


def get(request):
    content = {
        'summary': get_summary(request),
        'taxes': get_tax_types(request),
        'emissions_by_tax': get_emissions_by_tax(request),
        'emissions_by_month_and_tax': get_emissions_by_month_and_tax(request),
        'months': get_months(request),
        'payments_by_month': get_cumulative_payments_by_month(request),
    }
    return content